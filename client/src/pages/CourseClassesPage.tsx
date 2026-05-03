import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppModal from '../components/shared/AppModal';
import { useCourses } from '../context/CourseContext';
import { supabase } from '../lib/supabase';
import type { Course, CourseRow } from '../types/course';
import { rowToCourse } from '../types/course';

const MAX_STUDENTS_PER_CLASS = 35;
const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type CourseClass = {
  id: string;
  name?: string | null;
  course_id?: string | null;
  teacher_id?: string | null;
  schedule_days?: string[] | null;
  schedule_time?: string | null;
  student_ids?: string[] | null;
  created_at?: string | null;
  [key: string]: unknown;
};

type UserOption = {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
};

function getTextValue(record: CourseClass, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function getNextSectionName(classes: CourseClass[]) {
  return `Section ${String.fromCharCode(65 + classes.length)}`;
}

function formatSchedule(days?: string[] | null, time?: string | null) {
  const dayLabel = days && days.length > 0 ? days.join(', ') : 'Days not set';
  return time ? `${dayLabel} at ${time}` : dayLabel;
}

export default function CourseClassesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getCourseById, loading: coursesLoading } = useCourses();
  const contextCourse = courseId ? getCourseById(courseId) : undefined;

  const [course, setCourse] = useState<Course | null>(null);
  const [classes, setClasses] = useState<CourseClass[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [className, setClassName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isSavingClass, setIsSavingClass] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCourseClasses = useCallback(async () => {
    if (!courseId || coursesLoading) return;

    setPageLoading(true);
    setError(null);
    setClassesError(null);

    let selectedCourse = contextCourse ?? null;

    if (!selectedCourse) {
      const { data, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) {
        setError(courseError.message);
        setPageLoading(false);
        return;
      }

      selectedCourse = data ? rowToCourse(data as CourseRow) : null;
    }

    if (!selectedCourse) {
      setCourse(null);
      setClasses([]);
      setError('Course not found.');
      setPageLoading(false);
      return;
    }

    const { data: classRows, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('course_id', courseId)
      .order('name', { ascending: true });

    const nextClasses = (classRows as CourseClass[] | null) ?? [];
    const nextTeacherNames: Record<string, string> = {};

    const userIds = Array.from(new Set(
      nextClasses
        .map((courseClass) => courseClass.teacher_id)
        .filter((teacherId): teacherId is string => Boolean(teacherId)),
    ));

    if (userIds.length > 0) {
      const { data: userRows } = await supabase
        .from('users')
        .select('id, email, name, role')
        .in('id', userIds);

      (userRows as UserOption[] | null)?.forEach((user) => {
        if (user.role === 'teacher') {
          nextTeacherNames[user.id] = user.name?.trim() || 'Unnamed Teacher';
        }
      });
    }

    setCourse(selectedCourse);
    setClasses(nextClasses);
    setTeacherNames(nextTeacherNames);
    setClassesError(classError ? classError.message : null);
    setPageLoading(false);
  }, [contextCourse, courseId, coursesLoading]);

  useEffect(() => {
    loadCourseClasses();
  }, [loadCourseClasses]);

  const teachers = useMemo(() => users.filter((user) => user.role === 'teacher'), [users]);
  const students = useMemo(() => users.filter((user) => user.role === 'student'), [users]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) =>
      `${student.name} ${student.email}`.toLowerCase().includes(query),
    );
  }, [studentSearch, students]);

  const generatedSectionName = getNextSectionName(classes);
  const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId);
  const selectedStudents = students.filter((student) => selectedStudentIds.includes(student.id));

  const resetClassForm = useCallback(() => {
    if (!course) return;

    setClassName(getNextSectionName(classes));
    setSelectedDays([]);
    setScheduleTime('');
    setSelectedTeacherId('');
    setSelectedStudentIds([]);
    setStudentSearch('');
    setFormError(null);
  }, [classes.length, course]);

  const openAddClassModal = () => {
    resetClassForm();
    setIsAddClassOpen(true);
  };

  useEffect(() => {
    if (!isAddClassOpen || users.length > 0) return;

    async function loadUsers() {
      setUsersLoading(true);
      const { data, error: usersError } = await supabase
        .from('users')
        .select('id, email, name, role')
        .in('role', ['teacher', 'student'])
        .order('name', { ascending: true });

      if (usersError) {
        setFormError(usersError.message);
      } else {
        setUsers((data as UserOption[] | null) ?? []);
      }

      setUsersLoading(false);
    }

    loadUsers();
  }, [isAddClassOpen, users.length]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }

      if (prev.length >= MAX_STUDENTS_PER_CLASS) {
        setFormError(`A class can have a maximum of ${MAX_STUDENTS_PER_CLASS} students.`);
        return prev;
      }

      setFormError(null);
      return [...prev, studentId];
    });
  };

  const toggleScheduleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day],
    );
  };

  const handleCreateClass = async () => {
    if (!course || !courseId) return;

    if (!className.trim()) {
      setFormError('Enter a class name before creating the class.');
      return;
    }

    if (!selectedTeacher) {
      setFormError('Assign exactly one teacher to this class.');
      return;
    }

    if (selectedStudentIds.length > MAX_STUDENTS_PER_CLASS) {
      setFormError(`A class can have a maximum of ${MAX_STUDENTS_PER_CLASS} students.`);
      return;
    }

    setIsSavingClass(true);
    setFormError(null);

    try {
      const { error: classCreateError } = await supabase
        .from('classes')
        .insert({
          course_id: courseId,
          name: className.trim(),
          teacher_id: selectedTeacher.id,
          schedule_days: selectedDays,
          schedule_time: scheduleTime || null,
          student_ids: selectedStudentIds,
        })
        .select('id')
        .single();

      if (classCreateError) throw classCreateError;

      await loadCourseClasses();
      setIsAddClassOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create class.';
      setFormError(message);
    } finally {
      setIsSavingClass(false);
    }
  };

  if (coursesLoading || pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading course classes...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#fef2f2] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        </div>
        <p className="text-[14px] text-[#ef4444] font-semibold">Unable to load course</p>
        <p className="text-[13px] text-[#64748b] max-w-md text-center">{error || 'The selected course could not be found.'}</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-3 cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              Back to Courses
            </button>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{course.name}</h1>
            <p className="text-[14px] text-[#64748b] mt-1">Classes connected to {course.courseCode}.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center rounded-sm px-3 py-2 text-[12px] font-bold border ${
              course.status === 'Active'
                ? 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]'
                : 'bg-[#fee2e2] text-[#dc2626] border-[#fecaca]'
            }`}
            >
              {course.status}
            </span>
            <button
              onClick={openAddClassModal}
              className="inline-flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              Add Class
            </button>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden flex flex-col animate-fade-up">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-3 bg-[#fbf8fe]">
            <div>
              <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Course Classes</h3>
              <p className="text-[12.5px] text-[#64748b] mt-1">Department: {course.department} | Faculty lead: {course.facultyLead}</p>
            </div>
            <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
              {classes.length} {classes.length === 1 ? 'class' : 'classes'} shown
            </span>
          </div>

          {classesError && (
            <div className="m-5 rounded-sm border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-[13px] font-medium text-[#c2410c]">
              Could not load classes: {classesError}
            </div>
          )}

          {!classesError && classes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Class</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Teacher</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Students</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Schedule</th>
                    <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((courseClass, index) => {
                    const classNameValue = getTextValue(courseClass, ['name', 'title', 'section'], `Class ${String(index + 1).padStart(2, '0')}`);
                    const teacherName = courseClass.teacher_id ? teacherNames[courseClass.teacher_id] : '';
                    const schedule = formatSchedule(courseClass.schedule_days, courseClass.schedule_time);
                    const createdAt = courseClass.created_at ? new Date(courseClass.created_at).toLocaleDateString() : 'New';
                    const studentCount = courseClass.student_ids?.length ?? 0;

                    return (
                      <tr
                        key={courseClass.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/courses/${course.id}/classes/${courseClass.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/courses/${course.id}/classes/${courseClass.id}`);
                          }
                        }}
                        className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6a5182]/25 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-6">
                          <p className="text-[14px] font-bold text-[#1e293b] group-hover:text-[#6a5182] group-hover:underline underline-offset-4 transition-colors">{classNameValue}</p>
                          <p className="text-[12px] text-[#64748b] mt-1">{course.courseCode}</p>
                        </td>
                        <td className="py-4 px-6 text-[13px] font-semibold text-[#475569]">{teacherName || 'Unassigned'}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center rounded-sm bg-[#f3eff7] px-2.5 py-1 text-[12px] font-bold text-[#6a5182]">
                            {studentCount}/{MAX_STUDENTS_PER_CLASS}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{schedule}</td>
                        <td className="py-4 px-6 text-[13px] text-[#64748b]">{createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : !classesError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#6a5182] mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h18" /><path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4" /><path d="M12 16v4" /><path d="M8 20h8" /></svg>
              </div>
              <h2 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Classes Found</h2>
              <p className="text-[14px] text-[#64748b] max-w-md mb-4">This course does not have any classes linked to it yet.</p>
              <button
                onClick={openAddClassModal}
                className="bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm cursor-pointer"
              >
                Add First Class
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isAddClassOpen && (
        <AppModal onClose={() => setIsAddClassOpen(false)} widthClass="max-w-[920px]">
          <div className="bg-white rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Add Class</h3>
                <p className="text-[13px] text-[#64748b] mt-1">Create a section, choose the assigned teacher, and enroll up to {MAX_STUDENTS_PER_CLASS} students in this course.</p>
              </div>
              <button
                onClick={() => setIsAddClassOpen(false)}
                className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
              <div className="flex flex-col gap-5">
                <div className="rounded-sm border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                  <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-1">Suggested Section</p>
                  <p className="text-[18px] font-extrabold text-[#4b3f68] tracking-wide">{generatedSectionName}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Class Name</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Schedule Days</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DAY_OPTIONS.map((day) => {
                      const isSelected = selectedDays.includes(day);

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleScheduleDay(day)}
                          className={`rounded-sm border px-3 py-2 text-[12px] font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]'
                              : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Schedule Time</label>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(event) => setScheduleTime(event.target.value)}
                    placeholder="e.g. 10:00 AM - 11:30 AM"
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assigned Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(event) => setSelectedTeacherId(event.target.value)}
                    disabled={usersLoading || teachers.length === 0}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b] disabled:opacity-70"
                  >
                    <option value="">{usersLoading ? 'Loading teachers...' : 'Select one teacher'}</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                    ))}
                  </select>
                  {selectedTeacher && (
                    <div className="mt-2 rounded-sm border border-[#d8c8e9] bg-[#fbf8fe] px-3 py-2">
                      <p className="text-[13px] font-bold text-[#4b3f68]">{selectedTeacher.name}</p>
                      <p className="text-[12px] text-[#64748b] mt-0.5">{selectedTeacher.email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col min-h-0 rounded-sm border border-[#e2e8f0] overflow-hidden">
                <div className="p-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-extrabold text-[#4b3f68] uppercase tracking-wide">Student Assignment</p>
                      <p className="text-[12px] text-[#64748b] mt-1">Saved into this class row's student_ids list.</p>
                    </div>
                    <span className="rounded-sm bg-white border border-[#e2e8f0] px-3 py-2 text-[12px] font-bold text-[#64748b]">
                      {selectedStudentIds.length}/{MAX_STUDENTS_PER_CLASS}
                    </span>
                  </div>
                  <div className="mt-3 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6a5182] rounded-full transition-all"
                      style={{ width: `${Math.min(100, (selectedStudentIds.length / MAX_STUDENTS_PER_CLASS) * 100)}%` }}
                    />
                  </div>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search students by name or email"
                    className="mt-4 bg-white border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>

                <div className="max-h-[310px] overflow-y-auto divide-y divide-[#edf2f7]">
                  {usersLoading ? (
                    <div className="py-12 text-center text-[13px] text-[#64748b] font-semibold animate-pulse">Loading students...</div>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const isDisabled = !isSelected && selectedStudentIds.length >= MAX_STUDENTS_PER_CLASS;

                      return (
                        <label
                          key={student.id}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f8fafc] cursor-pointer'}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 accent-[#6a5182]"
                          />
                          <span className="w-9 h-9 rounded-full bg-[#f3eff7] text-[#6a5182] flex items-center justify-center text-[12px] font-extrabold shrink-0">
                            {student.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13.5px] font-bold text-[#1e293b] truncate">{student.name}</span>
                            <span className="block text-[12px] text-[#64748b] truncate">{student.email}</span>
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-[13px] text-[#64748b] font-semibold">No students found.</div>
                  )}
                </div>

                {selectedStudents.length > 0 && (
                  <div className="border-t border-[#e2e8f0] p-3 bg-[#f8fafc]">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Selected Students</p>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentIds([])}
                        className="text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[90px] overflow-y-auto">
                      {selectedStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => toggleStudent(student.id)}
                          className="inline-flex items-center gap-1.5 rounded-sm border border-[#d8c8e9] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#4b3f68] hover:bg-[#f3eff7] cursor-pointer"
                        >
                          {student.name}
                          <span aria-hidden="true">x</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formError && (
              <div className="mx-6 mb-4 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                {formError}
              </div>
            )}

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddClassOpen(false)}
                disabled={isSavingClass}
                className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateClass}
                disabled={isSavingClass || usersLoading}
                className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingClass && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isSavingClass ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </>
  );
}
