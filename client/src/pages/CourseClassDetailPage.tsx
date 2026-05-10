import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppModal from '../components/shared/AppModal';
import ConfirmActionModal from '../components/shared/ConfirmActionModal';
import { useCourses } from '../context/CourseContext';
import { supabase } from '../lib/supabase';
import type { Course, CourseRow } from '../types/course';
import { rowToCourse } from '../types/course';

const MAX_STUDENTS_PER_CLASS = 35;
const DAY_OPTIONS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type CourseClass = {
  id: string;
  course_id?: string | null;
  teacher_id?: string | null;
  name?: string | null;
  schedule_days?: string[] | string | null;
  schedule_time?: string | null;
  room?: string | null;
  student_ids?: string[] | null;
  created_at?: string | null;
};

type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
};

type ScheduleFormMode = 'weekly' | 'one_time';

type ClassScheduleEntry = {
  id: string;
  class_id: string;
  schedule_type: ScheduleFormMode;
  day_of_week?: string | null;
  schedule_date?: string | null;
  start_time: string;
  end_time: string;
  room?: string | null;
  notes?: string | null;
};

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function normalizeScheduleDay(value: string) {
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return '';

  return DAY_OPTIONS.find((day) => day.toLowerCase() === cleaned)
    ?? DAY_OPTIONS.find((day) => day.toLowerCase().startsWith(cleaned.slice(0, 3)))
    ?? '';
}

function parseScheduleDays(days?: string[] | string | null) {
  if (!days) return [];
  const normalizeDays = (values: unknown[]) =>
    Array.from(new Set(values.map((day) => normalizeScheduleDay(String(day))).filter(Boolean)));

  if (Array.isArray(days)) return normalizeDays(days);

  try {
    const parsed = JSON.parse(days);
    if (Array.isArray(parsed)) return normalizeDays(parsed);
  } catch {
    return normalizeDays(days.split(','));
  }

  return [];
}

function formatSchedule(days?: string[] | string | null, time?: string | null) {
  const parsedDays = parseScheduleDays(days);
  const dayLabel = parsedDays.length > 0 ? parsedDays.join(', ') : 'Days not set';
  return time ? `${dayLabel} at ${time}` : dayLabel;
}

function trimTime(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 5);
}

function formatScheduleEntry(entry: ClassScheduleEntry) {
  const time = `${trimTime(entry.start_time)} - ${trimTime(entry.end_time)}`;
  const day = entry.schedule_type === 'weekly'
    ? entry.day_of_week
    : entry.schedule_date
      ? new Date(`${entry.schedule_date}T00:00:00`).toLocaleDateString()
      : 'Selected day';

  return `${day} at ${time}`;
}

export default function CourseClassDetailPage() {
  const { courseId, classId } = useParams();
  const navigate = useNavigate();
  const { getCourseById, loading: coursesLoading } = useCourses();
  const contextCourse = courseId ? getCourseById(courseId) : undefined;

  const [course, setCourse] = useState<Course | null>(null);
  const [courseClass, setCourseClass] = useState<CourseClass | null>(null);
  const [teacher, setTeacher] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isSavingPeople, setIsSavingPeople] = useState(false);
  const [peopleError, setPeopleError] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleEntries, setScheduleEntries] = useState<ClassScheduleEntry[]>([]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleFormMode>('weekly');
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [scheduleRoom, setScheduleRoom] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isDeletingScheduleId, setIsDeletingScheduleId] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const loadClassDetails = useCallback(async () => {
    if (!courseId || !classId || coursesLoading) return;

    setIsLoading(true);
    setError(null);

    let selectedCourse = contextCourse ?? null;

    if (!selectedCourse) {
      const { data: courseRow, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) {
        setError(courseError.message);
        setIsLoading(false);
        return;
      }

      selectedCourse = courseRow ? rowToCourse(courseRow as CourseRow) : null;
    }

    const { data: classRow, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (classError) {
      setError(classError.message);
      setIsLoading(false);
      return;
    }

    if (!selectedCourse || !classRow) {
      setError('Class not found.');
      setIsLoading(false);
      return;
    }

    const selectedClass = classRow as CourseClass;
    const userIds = Array.from(new Set([
      ...(selectedClass.teacher_id ? [selectedClass.teacher_id] : []),
      ...(selectedClass.student_ids ?? []),
    ]));

    let teacherProfile: UserProfile | null = null;
    let studentProfiles: UserProfile[] = [];

    if (userIds.length > 0) {
      const { data: userRows, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, role')
        .in('id', userIds);

      if (usersError) {
        setError(usersError.message);
        setIsLoading(false);
        return;
      }

      const profiles = ((userRows as UserProfile[] | null) ?? []).map((user) => ({
        ...user,
        email: user.email ?? '',
        name: user.name?.trim() || 'Unnamed User',
      }));

      teacherProfile = profiles.find((user) => user.id === selectedClass.teacher_id) ?? null;
      studentProfiles = (selectedClass.student_ids ?? [])
        .map((studentId) => profiles.find((user) => user.id === studentId && user.role === 'student'))
        .filter((user): user is UserProfile => Boolean(user));
    }

    setCourse(selectedCourse);
    setCourseClass(selectedClass);
    setTeacher(teacherProfile);
    setStudents(studentProfiles);

    const { data: scheduleRows, error: scheduleLoadError } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('class_id', selectedClass.id)
      .order('schedule_type', { ascending: true })
      .order('day_of_week', { ascending: true })
      .order('schedule_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (scheduleLoadError) {
      setScheduleEntries([]);
      setScheduleError(scheduleLoadError.message);
    } else {
      setScheduleEntries((scheduleRows as ClassScheduleEntry[] | null) ?? []);
      setScheduleError('');
    }

    setIsLoading(false);
  }, [classId, contextCourse, courseId, coursesLoading]);

  useEffect(() => {
    loadClassDetails();
  }, [loadClassDetails]);

  const schedule = useMemo(
    () => formatSchedule(courseClass?.schedule_days, courseClass?.schedule_time),
    [courseClass],
  );

  const scheduledDays = useMemo(
    () => parseScheduleDays(courseClass?.schedule_days),
    [courseClass],
  );

  const weeklyScheduleEntries = useMemo(
    () => scheduleEntries.filter((entry) => entry.schedule_type === 'weekly'),
    [scheduleEntries],
  );

  const oneTimeScheduleEntries = useMemo(
    () => scheduleEntries.filter((entry) => entry.schedule_type === 'one_time'),
    [scheduleEntries],
  );

  const scheduleSummary = useMemo(() => {
    if (scheduleEntries.length === 0) return schedule;
    return `${scheduleEntries.length} ${scheduleEntries.length === 1 ? 'schedule entry' : 'schedule entries'}`;
  }, [schedule, scheduleEntries.length]);

  const teachers = useMemo(() => allUsers.filter((user) => user.role === 'teacher'), [allUsers]);
  const availableStudents = useMemo(() => allUsers.filter((user) => user.role === 'student'), [allUsers]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return availableStudents;

    return availableStudents.filter((student) =>
      `${student.name} ${student.email}`.toLowerCase().includes(query),
    );
  }, [availableStudents, studentSearch]);

  const selectedPeopleStudents = useMemo(
    () => availableStudents.filter((student) => selectedStudentIds.includes(student.id)),
    [availableStudents, selectedStudentIds],
  );

  const loadAssignableUsers = useCallback(async () => {
    setUsersLoading(true);
    setPeopleError('');

    const { data, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .in('role', ['teacher', 'student'])
      .order('name', { ascending: true });

    if (usersError) {
      setPeopleError(usersError.message);
      setUsersLoading(false);
      return;
    }

    setAllUsers(((data as UserProfile[] | null) ?? []).map((user) => ({
      ...user,
      email: user.email ?? '',
      name: user.name?.trim() || 'Unnamed User',
    })));
    setUsersLoading(false);
  }, []);

  const openManagePeople = async () => {
    if (!courseClass) return;

    setSelectedTeacherId(courseClass.teacher_id ?? '');
    setSelectedStudentIds(courseClass.student_ids ?? []);
    setStudentSearch('');
    setPeopleError('');
    setIsManageOpen(true);

    if (allUsers.length === 0) {
      await loadAssignableUsers();
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }

      if (prev.length >= MAX_STUDENTS_PER_CLASS) {
        setPeopleError(`A class can have a maximum of ${MAX_STUDENTS_PER_CLASS} students.`);
        return prev;
      }

      setPeopleError('');
      return [...prev, studentId];
    });
  };

  const handleSavePeople = async () => {
    if (!courseClass) return;

    setIsSavingPeople(true);
    setPeopleError('');

    const { error: updateError } = await supabase
      .from('classes')
      .update({
        teacher_id: selectedTeacherId || null,
        student_ids: selectedStudentIds,
      })
      .eq('id', courseClass.id);

    if (updateError) {
      setPeopleError(updateError.message);
      setIsSavingPeople(false);
      return;
    }

    await loadClassDetails();
    setIsSavingPeople(false);
    setIsManageOpen(false);
  };

  const openManageSchedule = () => {
    if (!courseClass) return;

    navigate(`/schedule/classes/${courseClass.id}`);
  };

  const resetScheduleForm = () => {
    setScheduleMode('weekly');
    setScheduleDays([]);
    setScheduleDate(new Date().toISOString().slice(0, 10));
    setScheduleStartTime('');
    setScheduleEndTime('');
    setScheduleRoom(courseClass?.room ?? '');
    setScheduleNotes('');
  };

  const toggleScheduleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const handleSaveSchedule = async () => {
    if (!courseClass) return;

    if (scheduleMode === 'weekly' && scheduleDays.length === 0) {
      setScheduleError('Choose at least one day for the weekly schedule.');
      return;
    }

    if (scheduleMode === 'one_time' && !scheduleDate) {
      setScheduleError('Choose the date for this one-day schedule.');
      return;
    }

    if (!scheduleStartTime || !scheduleEndTime) {
      setScheduleError('Add both start and end times.');
      return;
    }

    if (scheduleEndTime <= scheduleStartTime) {
      setScheduleError('End time must be after the start time.');
      return;
    }

    setIsSavingSchedule(true);
    setScheduleError('');

    const entriesToInsert = scheduleMode === 'weekly'
      ? scheduleDays.map((day) => ({
        class_id: courseClass.id,
        schedule_type: 'weekly',
        day_of_week: day,
        schedule_date: null,
        start_time: scheduleStartTime,
        end_time: scheduleEndTime,
        room: scheduleRoom.trim() || null,
        notes: scheduleNotes.trim() || null,
      }))
      : [{
        class_id: courseClass.id,
        schedule_type: 'one_time',
        day_of_week: null,
        schedule_date: scheduleDate,
        start_time: scheduleStartTime,
        end_time: scheduleEndTime,
        room: scheduleRoom.trim() || null,
        notes: scheduleNotes.trim() || null,
      }];

    const { error: insertError } = await supabase
      .from('class_schedules')
      .insert(entriesToInsert);

    if (insertError) {
      setScheduleError(insertError.message);
      setIsSavingSchedule(false);
      return;
    }

    if (scheduleMode === 'weekly') {
      await supabase
        .from('classes')
        .update({
          schedule_days: scheduleDays,
          schedule_time: `${scheduleStartTime} - ${scheduleEndTime}`,
          room: scheduleRoom.trim() || null,
        })
        .eq('id', courseClass.id);
    }

    await loadClassDetails();
    setIsSavingSchedule(false);
    resetScheduleForm();
  };

  const handleDeleteScheduleEntry = async (entryId: string) => {
    setIsDeletingScheduleId(entryId);
    setScheduleError('');

    const { error: deleteError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', entryId);

    if (deleteError) {
      setScheduleError(deleteError.message);
      setIsDeletingScheduleId('');
      return;
    }

    await loadClassDetails();
    setIsDeletingScheduleId('');
  };

  const handleDeleteClass = async () => {
    if (!courseClass || !courseId) return;

    setIsDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', courseClass.id);

    if (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }

    navigate(`/courses/${courseId}/classes`);
  };

  if (coursesLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading class details...</p>
      </div>
    );
  }

  if (error || !course || !courseClass) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#fef2f2] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        </div>
        <p className="text-[14px] text-[#ef4444] font-semibold">Unable to load class</p>
        <p className="text-[13px] text-[#64748b] max-w-md text-center">{error || 'The selected class could not be found.'}</p>
        <button
          onClick={() => navigate(`/courses/${courseId}/classes`)}
          className="mt-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`/courses/${course.id}/classes`)}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-3 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Back to Classes
          </button>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{courseClass.name || 'Class Details'}</h1>
          <p className="text-[14px] text-[#64748b] mt-1">{course.name} | {course.courseCode}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openManageSchedule}
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#d8c8e9] hover:bg-[#f3eff7] text-[#6a5182] text-[13.5px] font-bold px-5 py-2.5 rounded-sm transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /></svg>
            Manage Schedule
          </button>
          <button
            onClick={openManagePeople}
            className="inline-flex items-center justify-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-bold px-5 py-2.5 rounded-sm transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Manage Teacher & Students
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] border border-[#fecaca] text-[13.5px] font-bold px-5 py-2.5 rounded-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            {isDeleting ? 'Deleting...' : 'Delete Class'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <div className="flex flex-col gap-6">
          <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
              <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Class Summary</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Schedule</p>
                <p className="text-[14px] font-bold text-[#1e293b]">{scheduleSummary}</p>
                {scheduleEntries.length > 0 ? (
                  <div className="flex flex-col gap-1.5 mt-3">
                    {scheduleEntries.slice(0, 3).map((entry) => (
                      <p key={entry.id} className="text-[12px] font-semibold text-[#64748b]">
                        {formatScheduleEntry(entry)}
                      </p>
                    ))}
                    {scheduleEntries.length > 3 && (
                      <p className="text-[12px] font-bold text-[#6a5182]">+{scheduleEntries.length - 3} more</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {scheduledDays.length > 0 ? scheduledDays.map((day) => (
                      <span key={day} className="rounded-sm bg-[#f3eff7] px-2 py-0.5 text-[11px] font-bold text-[#6a5182]">
                        {day.slice(0, 3)}
                      </span>
                    )) : (
                      <span className="text-[12px] font-semibold text-[#94a3b8]">No schedule created</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Room</p>
                <p className="text-[14px] font-bold text-[#1e293b]">{courseClass.room || 'Room not set'}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Created</p>
                <p className="text-[14px] font-bold text-[#1e293b]">
                  {courseClass.created_at ? new Date(courseClass.created_at).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Students</p>
                <div className="flex items-center gap-3">
                  <p className="text-[24px] font-extrabold text-[#6a5182] leading-none">{students.length}</p>
                  <p className="text-[12px] font-bold text-[#64748b]">of {MAX_STUDENTS_PER_CLASS} assigned</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
              <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Assigned Teacher</h2>
            </div>
            <div className="p-5">
              {teacher ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#f3eff7] text-[#6a5182] flex items-center justify-center text-[14px] font-extrabold shrink-0">
                    {initials(teacher.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-extrabold text-[#1e293b] truncate">{teacher.name}</p>
                    <p className="text-[13px] text-[#64748b] truncate mt-0.5">{teacher.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] font-semibold text-[#94a3b8]">No teacher assigned.</p>
              )}
            </div>
          </section>
        </div>

        <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Students In Class</h2>
              <p className="text-[12.5px] text-[#64748b] mt-1">Students saved in this class row's student_ids list.</p>
            </div>
            <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-2 text-[12px] font-bold text-[#64748b]">
              {students.length}/{MAX_STUDENTS_PER_CLASS}
            </span>
          </div>

          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider w-[80px]">S.No</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Student</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/students/${student.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/students/${student.id}`);
                        }
                      }}
                      className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6a5182]/25 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 text-[13px] font-bold text-[#94a3b8]">{String(index + 1).padStart(2, '0')}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#eef2f7] text-[#475569] flex items-center justify-center text-[12px] font-extrabold shrink-0">
                            {initials(student.name)}
                          </div>
                          <p className="text-[14px] font-bold text-[#1e293b] group-hover:text-[#6a5182] group-hover:underline underline-offset-4 transition-colors">{student.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[13px] text-[#64748b]">{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#6a5182] mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <h3 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Students Assigned</h3>
              <p className="text-[14px] text-[#64748b] max-w-md">This class does not have any students in student_ids yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
    {isScheduleOpen && (
      <AppModal onClose={() => setIsScheduleOpen(false)} widthClass="max-w-[1040px]">
        <div className="bg-white rounded-md shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Manage Class Schedule</h3>
              <p className="text-[13px] text-[#64748b] mt-1">Create one-day sessions or recurring weekly sessions for {courseClass.name || 'this class'}.</p>
            </div>
            <button
              onClick={() => setIsScheduleOpen(false)}
              className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-6">
            <section className="rounded-sm border border-[#e2e8f0] bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
                <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Create Schedule</p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {(['weekly', 'one_time'] as ScheduleFormMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setScheduleMode(mode)}
                      className={`rounded-sm border px-3 py-2.5 text-[12px] font-bold transition-colors cursor-pointer ${
                        scheduleMode === mode
                          ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]'
                          : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'
                      }`}
                    >
                      {mode === 'weekly' ? 'Weekly' : 'One Day'}
                    </button>
                  ))}
                </div>

                {scheduleMode === 'weekly' ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Teaching Days</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DAY_OPTIONS.map((day) => {
                        const isSelected = scheduleDays.includes(day);

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleScheduleDay(day)}
                            className={`rounded-sm border px-3 py-2.5 text-[12px] font-bold transition-colors cursor-pointer ${
                              isSelected
                                ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]'
                                : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Schedule Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Start</label>
                    <input
                      type="time"
                      value={scheduleStartTime}
                      onChange={(event) => setScheduleStartTime(event.target.value)}
                      className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">End</label>
                    <input
                      type="time"
                      value={scheduleEndTime}
                      onChange={(event) => setScheduleEndTime(event.target.value)}
                      className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Room</label>
                  <input
                    type="text"
                    value={scheduleRoom}
                    onChange={(event) => setScheduleRoom(event.target.value)}
                    placeholder="Room 205"
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Notes</label>
                  <input
                    type="text"
                    value={scheduleNotes}
                    onChange={(event) => setScheduleNotes(event.target.value)}
                    placeholder="Lecture, lab, exam prep..."
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>

                {scheduleError && (
                  <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                    {scheduleError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule}
                  className="w-full justify-center px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingSchedule && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isSavingSchedule ? 'Saving...' : `Add ${scheduleMode === 'weekly' ? 'Weekly' : 'One-Day'} Schedule`}
                </button>
              </div>
            </section>

            <section className="rounded-sm border border-[#e2e8f0] bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Saved Schedule</p>
                  <p className="text-[12px] text-[#64748b] mt-1">{scheduleEntries.length} entries for this class</p>
                </div>
                <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-1.5 text-[12px] font-bold text-[#64748b]">
                  {course.courseCode}
                </span>
              </div>

              <div className="p-4 flex flex-col gap-5 max-h-[560px] overflow-y-auto">
                <div>
                  <h4 className="text-[12px] font-extrabold text-[#64748b] uppercase tracking-wider mb-3">Weekly</h4>
                  {weeklyScheduleEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {weeklyScheduleEntries.map((entry) => (
                        <div key={entry.id} className="rounded-sm border border-[#e2d9ed] bg-[#fbf8fe] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13.5px] font-extrabold text-[#4b3f68]">{entry.day_of_week}</p>
                              <p className="text-[12px] font-bold text-[#64748b] mt-1">{trimTime(entry.start_time)} - {trimTime(entry.end_time)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteScheduleEntry(entry.id)}
                              disabled={isDeletingScheduleId === entry.id}
                              className="text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer disabled:opacity-60"
                            >
                              {isDeletingScheduleId === entry.id ? 'Deleting' : 'Delete'}
                            </button>
                          </div>
                          <p className="text-[12px] text-[#64748b] mt-2">{entry.room || 'Room not set'}</p>
                          {entry.notes && <p className="text-[12px] text-[#475569] mt-1">{entry.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-sm border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center text-[13px] font-semibold text-[#64748b]">
                      No weekly schedule entries yet.
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-[12px] font-extrabold text-[#64748b] uppercase tracking-wider mb-3">One-Day</h4>
                  {oneTimeScheduleEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {oneTimeScheduleEntries.map((entry) => (
                        <div key={entry.id} className="rounded-sm border border-[#e2e8f0] bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[13.5px] font-extrabold text-[#4b3f68]">{formatScheduleEntry(entry).split(' at ')[0]}</p>
                              <p className="text-[12px] font-bold text-[#64748b] mt-1">{trimTime(entry.start_time)} - {trimTime(entry.end_time)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteScheduleEntry(entry.id)}
                              disabled={isDeletingScheduleId === entry.id}
                              className="text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer disabled:opacity-60"
                            >
                              {isDeletingScheduleId === entry.id ? 'Deleting' : 'Delete'}
                            </button>
                          </div>
                          <p className="text-[12px] text-[#64748b] mt-2">{entry.room || 'Room not set'}</p>
                          {entry.notes && <p className="text-[12px] text-[#475569] mt-1">{entry.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-sm border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center text-[13px] font-semibold text-[#64748b]">
                      No one-day schedule entries yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(false)}
              className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </AppModal>
    )}
    {isManageOpen && (
      <AppModal onClose={() => setIsManageOpen(false)} widthClass="max-w-[920px]">
        <div className="bg-white rounded-md shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Manage Teacher & Students</h3>
              <p className="text-[13px] text-[#64748b] mt-1">Change the assigned teacher and update this class roster.</p>
            </div>
            <button
              onClick={() => setIsManageOpen(false)}
              className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
            <div className="flex flex-col gap-5">
              <div className="rounded-sm border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Class</p>
                <p className="text-[18px] font-extrabold text-[#4b3f68] tracking-tight">{courseClass.name || 'Class Details'}</p>
                <p className="text-[12.5px] text-[#64748b] mt-1">{course.name} | {schedule}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assigned Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(event) => setSelectedTeacherId(event.target.value)}
                  disabled={usersLoading}
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b] disabled:opacity-70"
                >
                  <option value="">{usersLoading ? 'Loading teachers...' : 'No teacher assigned'}</option>
                  {teachers.map((teacherOption) => (
                    <option key={teacherOption.id} value={teacherOption.id}>{teacherOption.name}</option>
                  ))}
                </select>
                {selectedTeacherId && (
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherId('')}
                    className="self-start text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer"
                  >
                    Remove assigned teacher
                  </button>
                )}
              </div>

              <div className="rounded-sm border border-[#e2e8f0] bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Selected Students</p>
                  <span className="rounded-sm bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 text-[12px] font-bold text-[#64748b]">
                    {selectedStudentIds.length}/{MAX_STUDENTS_PER_CLASS}
                  </span>
                </div>
                {selectedPeopleStudents.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto">
                    {selectedPeopleStudents.map((studentOption) => (
                      <button
                        key={studentOption.id}
                        type="button"
                        onClick={() => toggleStudent(studentOption.id)}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-[#d8c8e9] bg-[#fbf8fe] px-2.5 py-1.5 text-[12px] font-semibold text-[#4b3f68] hover:bg-[#f3eff7] cursor-pointer"
                      >
                        {studentOption.name}
                        <span aria-hidden="true">x</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-[#94a3b8]">No students selected.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col min-h-0 rounded-sm border border-[#e2e8f0] overflow-hidden">
              <div className="p-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Available Students</p>
                    <p className="text-[12px] text-[#64748b] mt-1">Check to add. Uncheck or remove chips to remove.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search students by name or email"
                  className="mt-4 bg-white border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                />
              </div>

              <div className="max-h-[390px] overflow-y-auto divide-y divide-[#edf2f7]">
                {usersLoading ? (
                  <div className="py-12 text-center text-[13px] text-[#64748b] font-semibold animate-pulse">Loading users...</div>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((studentOption) => {
                    const isSelected = selectedStudentIds.includes(studentOption.id);
                    const isDisabled = !isSelected && selectedStudentIds.length >= MAX_STUDENTS_PER_CLASS;

                    return (
                      <label
                        key={studentOption.id}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f8fafc] cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => toggleStudent(studentOption.id)}
                          className="w-4 h-4 accent-[#6a5182]"
                        />
                        <span className="w-9 h-9 rounded-full bg-[#f3eff7] text-[#6a5182] flex items-center justify-center text-[12px] font-extrabold shrink-0">
                          {initials(studentOption.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{studentOption.name}</span>
                          <span className="block text-[12px] text-[#64748b] truncate">{studentOption.email}</span>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[13px] text-[#64748b] font-semibold">No students found.</div>
                )}
              </div>
            </div>
          </div>

          {peopleError && (
            <div className="mx-6 mb-4 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
              {peopleError}
            </div>
          )}

          <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsManageOpen(false)}
              disabled={isSavingPeople}
              className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePeople}
              disabled={isSavingPeople || usersLoading}
              className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSavingPeople && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isSavingPeople ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </AppModal>
    )}
    <ConfirmActionModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={handleDeleteClass}
      title="Delete Class"
      message="This will permanently remove the class from this course. Student and teacher accounts will not be deleted."
      subjectLabel={`${courseClass.name || 'Class'} | ${course.name}`}
      confirmLabel={isDeleting ? 'Deleting...' : 'Delete Class'}
    />
    </>
  );
}
