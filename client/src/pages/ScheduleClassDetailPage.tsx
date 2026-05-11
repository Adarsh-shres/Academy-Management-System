/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users } from '../components/shared/icons';
import AppModal from '../components/shared/AppModal';
import { useCourses } from '../context/CourseContext';
import { getScheduleCourseId } from '../lib/scheduleCourseSelection';
import { getScheduleTeacherId } from '../lib/scheduleTeacherSelection';
import { supabase } from '../lib/supabase';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type CourseClass = {
  id: string;
  batch_id?: string | null;
  course_id?: string | null;
  name?: string | null;
  teacher_id?: string | null;
  teacher_ids?: string[] | null;
  room?: string | null;
  student_ids?: string[] | null;
  batches?: {
    name?: string | null;
    code?: string | null;
    course_ids?: string[] | null;
  } | null;
};

type ScheduleEntry = {
  id: string;
  class_id: string;
  course_id?: string | null;
  teacher_id?: string | null;
  schedule_type: 'weekly' | 'one_time';
  day_of_week?: string | null;
  schedule_date?: string | null;
  start_time: string;
  end_time: string;
  room?: string | null;
  notes?: string | null;
};

type TodayDraft = {
  sourceId: string;
  course_id: string;
  teacher_id: string;
  day_of_week?: string;
  start_time: string;
  end_time: string;
  room: string;
  notes: string;
};

function trimTime(value?: string | null) {
  return value ? value.slice(0, 5) : '';
}

function getToday() {
  const date = new Date();
  const dateText = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  return { dateText, day };
}

function sortByTime(entries: ScheduleEntry[]) {
  return [...entries].sort((a, b) => `${a.start_time}${a.end_time}`.localeCompare(`${b.start_time}${b.end_time}`));
}

function formatEntry(entry: ScheduleEntry) {
  return `${trimTime(entry.start_time)} - ${trimTime(entry.end_time)}`;
}

type TeacherOption = {
  id: string;
  name: string;
};

function makeDraft(entry: ScheduleEntry, courseId: string, teacherId: string): TodayDraft {
  return {
    sourceId: entry.id,
    course_id: entry.course_id || courseId,
    teacher_id: entry.teacher_id || teacherId,
    start_time: trimTime(entry.start_time),
    end_time: trimTime(entry.end_time),
    room: entry.room ?? '',
    notes: entry.notes ?? '',
  };
}

function teacherIdsForClass(classRow: CourseClass) {
  return Array.from(new Set([...(classRow.teacher_ids ?? []), ...(classRow.teacher_id ? [classRow.teacher_id] : [])]));
}

export default function ScheduleClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const [courseClass, setCourseClass] = useState<CourseClass | null>(null);
  const [teacherNames, setTeacherNames] = useState<string[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'today'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWeeklyEditorOpen, setIsWeeklyEditorOpen] = useState(false);
  const [weeklyDrafts, setWeeklyDrafts] = useState<TodayDraft[]>([]);
  const [isSavingWeekly, setIsSavingWeekly] = useState(false);
  const [weeklyError, setWeeklyError] = useState('');
  const [isTodayEditorOpen, setIsTodayEditorOpen] = useState(false);
  const [todayDrafts, setTodayDrafts] = useState<TodayDraft[]>([]);
  const [isSavingToday, setIsSavingToday] = useState(false);
  const [todayError, setTodayError] = useState('');
  const [deletingScheduleId, setDeletingScheduleId] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const loadClassSchedule = useCallback(async () => {
    if (!classId) return;

    setIsLoading(true);
    setError('');

    const { data: classRow, error: classError } = await supabase
      .from('classes')
      .select('id, batch_id, course_id, name, teacher_id, teacher_ids, room, student_ids, batches(name, code, course_ids)')
      .eq('id', classId)
      .maybeSingle();

    if (classError || !classRow) {
      setError(classError?.message || 'Class not found.');
      setIsLoading(false);
      return;
    }

    const nextClass = classRow as CourseClass;
    setCourseClass(nextClass);

    const { data: allTeacherRows } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'teacher')
      .order('name', { ascending: true });

    const nextTeacherOptions = ((allTeacherRows as Array<{ id: string; name?: string | null }> | null) ?? [])
      .map((teacher) => ({
        id: teacher.id,
        name: teacher.name?.trim() || 'Unnamed Teacher',
      }));
    setTeacherOptions(nextTeacherOptions);

    const teacherIds = teacherIdsForClass(nextClass);
    if (teacherIds.length > 0) {
      const nameById = new Map(nextTeacherOptions.map((teacher) => [teacher.id, teacher.name]));
      setTeacherNames(teacherIds.map((teacherId) => nameById.get(teacherId)).filter((name): name is string => Boolean(name)));
    } else {
      setTeacherNames([]);
    }

    const { data: scheduleRows, error: scheduleError } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('class_id', classId)
      .order('schedule_type', { ascending: true })
      .order('day_of_week', { ascending: true })
      .order('schedule_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (scheduleError) {
      setError(scheduleError.message);
      setScheduleEntries([]);
    } else {
      setScheduleEntries((scheduleRows as ScheduleEntry[] | null) ?? []);
    }

    setIsLoading(false);
  }, [classId]);

  useEffect(() => {
    loadClassSchedule();
  }, [loadClassSchedule]);

  const { day: todayDay, dateText: todayDate } = getToday();

  const weeklyEntries = useMemo(
    () => scheduleEntries.filter((entry) => entry.schedule_type === 'weekly'),
    [scheduleEntries],
  );

  const todayWeeklyEntries = useMemo(
    () => sortByTime(weeklyEntries.filter((entry) => entry.day_of_week === todayDay)),
    [todayDay, weeklyEntries],
  );

  const todayOverrideEntries = useMemo(
    () => sortByTime(scheduleEntries.filter((entry) => entry.schedule_type === 'one_time' && entry.schedule_date === todayDate)),
    [scheduleEntries, todayDate],
  );

  const displayedTodayEntries = todayOverrideEntries.length > 0 ? todayOverrideEntries : todayWeeklyEntries;
  const todayUsesOverride = todayOverrideEntries.length > 0;
  const batchCourseIds = courseClass?.batches?.course_ids ?? [];
  const batchCourseOptions = courses.filter((course) => batchCourseIds.includes(course.id));
  const defaultCourseId = getScheduleCourseId({}, { course_id: courseClass?.course_id, batchCourseIds });
  const defaultTeacherId = getScheduleTeacherId({}, {
    teacher_id: courseClass?.teacher_id,
    teacher_ids: courseClass?.teacher_ids,
  });

  const weeklyMap = useMemo(() => {
    const map: Record<string, ScheduleEntry[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      map[day] = [];
    });

    weeklyEntries.forEach((entry) => {
      if (entry.day_of_week && map[entry.day_of_week]) {
        map[entry.day_of_week].push(entry);
      }
    });

    DAYS_OF_WEEK.forEach((day) => {
      map[day] = sortByTime(map[day]);
    });

    return map;
  }, [weeklyEntries]);

  const openTodayEditor = () => {
    const sourceEntries = todayOverrideEntries.length > 0 ? todayOverrideEntries : todayWeeklyEntries;
    setTodayDrafts(sourceEntries.map((entry) => makeDraft(entry, defaultCourseId, defaultTeacherId)));
    setTodayError('');
    setIsTodayEditorOpen(true);
  };

  const openWeeklyEditor = () => {
    setWeeklyDrafts(weeklyEntries.map((entry) => ({
      ...makeDraft(entry, defaultCourseId, defaultTeacherId),
      day_of_week: entry.day_of_week || todayDay,
    })));
    setWeeklyError('');
    setIsWeeklyEditorOpen(true);
  };

  const updateTodayDraft = (index: number, field: keyof Omit<TodayDraft, 'sourceId'>, value: string) => {
    setTodayDrafts((prev) => prev.map((draft, draftIndex) => (
      draftIndex === index ? { ...draft, [field]: value } : draft
    )));
  };

  const updateWeeklyDraft = (index: number, field: keyof Omit<TodayDraft, 'sourceId'>, value: string) => {
    setWeeklyDrafts((prev) => prev.map((draft, draftIndex) => (
      draftIndex === index ? { ...draft, [field]: value } : draft
    )));
  };

  const removeTodayDraft = (index: number) => {
    setTodayDrafts((prev) => prev.filter((_, draftIndex) => draftIndex !== index));
  };

  const addTodayDraft = () => {
    setTodayDrafts((prev) => [...prev, {
      sourceId: `new-${Date.now()}`,
      course_id: defaultCourseId,
      teacher_id: defaultTeacherId,
      start_time: '',
      end_time: '',
      room: courseClass?.room ?? '',
      notes: '',
    }]);
  };

  const addWeeklyDraft = () => {
    setWeeklyDrafts((prev) => [...prev, {
      sourceId: `new-weekly-${Date.now()}`,
      course_id: defaultCourseId,
      teacher_id: defaultTeacherId,
      day_of_week: todayDay,
      start_time: '',
      end_time: '',
      room: courseClass?.room ?? '',
      notes: '',
    }]);
  };

  const removeWeeklyDraft = (index: number) => {
    setWeeklyDrafts((prev) => prev.filter((_, draftIndex) => draftIndex !== index));
  };

  const saveWeeklySchedule = async () => {
    if (!classId) return;

    const invalidDraft = weeklyDrafts.find((draft) => !draft.course_id || !draft.teacher_id || !draft.day_of_week || !draft.start_time || !draft.end_time || draft.end_time <= draft.start_time);
    if (invalidDraft) {
      setWeeklyError('Each weekly row needs a course, teacher, day, and valid start and end times.');
      return;
    }

    setIsSavingWeekly(true);
    setWeeklyError('');

    const { error: deleteError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('class_id', classId)
      .eq('schedule_type', 'weekly');

    if (deleteError) {
      setWeeklyError(deleteError.message);
      setIsSavingWeekly(false);
      return;
    }

    if (weeklyDrafts.length > 0) {
      const { error: insertError } = await supabase
        .from('class_schedules')
        .insert(weeklyDrafts.map((draft) => ({
          class_id: classId,
          course_id: draft.course_id || null,
          teacher_id: draft.teacher_id || null,
          schedule_type: 'weekly',
          day_of_week: draft.day_of_week,
          schedule_date: null,
          start_time: draft.start_time,
          end_time: draft.end_time,
          room: draft.room.trim() || null,
          notes: draft.notes.trim() || null,
        })));

      if (insertError) {
        setWeeklyError(insertError.message);
        setIsSavingWeekly(false);
        return;
      }
    }

    await loadClassSchedule();
    setIsSavingWeekly(false);
    setIsWeeklyEditorOpen(false);
  };

  const saveTodayOverride = async () => {
    if (!classId) return;

    const invalidDraft = todayDrafts.find((draft) => !draft.course_id || !draft.teacher_id || !draft.start_time || !draft.end_time || draft.end_time <= draft.start_time);
    if (invalidDraft) {
      setTodayError('Each today schedule row needs a course, teacher, and valid start and end time.');
      return;
    }

    setIsSavingToday(true);
    setTodayError('');

    const { error: deleteError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('class_id', classId)
      .eq('schedule_type', 'one_time')
      .eq('schedule_date', todayDate);

    if (deleteError) {
      setTodayError(deleteError.message);
      setIsSavingToday(false);
      return;
    }

    if (todayDrafts.length > 0) {
      const { error: insertError } = await supabase
        .from('class_schedules')
        .insert(todayDrafts.map((draft) => ({
          class_id: classId,
          course_id: draft.course_id || null,
          teacher_id: draft.teacher_id || null,
          schedule_type: 'one_time',
          day_of_week: null,
          schedule_date: todayDate,
          start_time: draft.start_time,
          end_time: draft.end_time,
          room: draft.room.trim() || null,
          notes: draft.notes.trim() || null,
        })));

      if (insertError) {
        setTodayError(insertError.message);
        setIsSavingToday(false);
        return;
      }
    }

    await loadClassSchedule();
    setIsSavingToday(false);
    setIsTodayEditorOpen(false);
  };

  const clearTodayOverride = async () => {
    if (!classId) return;

    setIsSavingToday(true);
    setTodayError('');

    const { error: deleteError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('class_id', classId)
      .eq('schedule_type', 'one_time')
      .eq('schedule_date', todayDate);

    if (deleteError) {
      setTodayError(deleteError.message);
      setIsSavingToday(false);
      return;
    }

    await loadClassSchedule();
    setIsSavingToday(false);
    setIsTodayEditorOpen(false);
  };

  const removeScheduleEntry = async (entryId: string) => {
    setDeletingScheduleId(entryId);
    setDeleteError('');

    const { error: removeError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', entryId)
      .eq('class_id', classId);

    if (removeError) {
      setDeleteError(removeError.message);
      setDeletingScheduleId('');
      return;
    }

    await loadClassSchedule();
    setDeletingScheduleId('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading schedule...</p>
      </div>
    );
  }

  if (error || !courseClass) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[14px] text-[#ef4444] font-semibold">Unable to load schedule</p>
        <p className="text-[13px] text-[#64748b] max-w-md text-center">{error || 'The selected class could not be found.'}</p>
        <button
          onClick={() => navigate('/schedule')}
          className="mt-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer"
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  const teacherDisplay = teacherNames.length > 0 ? teacherNames.join(', ') : 'No teacher assigned';
  const courseNameForEntry = (entry: ScheduleEntry) => {
    const courseId = getScheduleCourseId(entry, { course_id: courseClass.course_id, batchCourseIds });
    return courses.find((course) => course.id === courseId)?.name ?? 'Course not selected';
  };
  const teacherNameForEntry = (entry: ScheduleEntry) => {
    const teacherId = getScheduleTeacherId(entry, {
      teacher_id: courseClass.teacher_id,
      teacher_ids: courseClass.teacher_ids,
    });
    return teacherOptions.find((teacher) => teacher.id === teacherId)?.name ?? 'Teacher not selected';
  };

  const renderScheduleCard = (entry: ScheduleEntry) => (
    <div key={entry.id} className="rounded-sm border border-[#e2d9ed] bg-white p-4">
      <div className="flex justify-between items-start gap-3">
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[#e0f2fe] text-[#0284c7]">
          {formatEntry(entry)}
        </span>
        <span className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-sm">
          {courseClass.batches?.code || 'Batch'}
        </span>
      </div>
      <h4 className="text-[15px] font-bold text-[#4b3f68] mt-3">{courseNameForEntry(entry)}</h4>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-[#475569] mt-3">
        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#94a3b8]" /> {entry.room || courseClass.room || 'Room not set'}</span>
        <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {teacherNameForEntry(entry)}</span>
        <span>{courseClass.student_ids?.length ?? 0} students</span>
      </div>
      {entry.notes && <p className="text-[12px] text-[#475569] mt-3">{entry.notes}</p>}
      <div className="mt-4 border-t border-[#edf2f7] pt-3">
        <button
          type="button"
          onClick={() => void removeScheduleEntry(entry.id)}
          disabled={deletingScheduleId === entry.id}
          className="text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {deletingScheduleId === entry.id ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-6 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/schedule')}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] mb-3 cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              Back to Schedule
            </button>
            <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{courseClass.name || 'Class Schedule'}</h1>
            <p className="text-[14px] text-[#64748b] mt-1">{courseClass.batches?.name || 'Batch'} | {teacherDisplay}</p>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-4 py-2 rounded-sm text-[13px] font-bold border transition-colors cursor-pointer ${activeTab === 'weekly' ? 'bg-[#6a5182] border-[#6a5182] text-white' : 'bg-white border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7]'}`}
              >
                Weekly Schedule
              </button>
              <button
                onClick={() => setActiveTab('today')}
                className={`px-4 py-2 rounded-sm text-[13px] font-bold border transition-colors cursor-pointer ${activeTab === 'today' ? 'bg-[#6a5182] border-[#6a5182] text-white' : 'bg-white border-[#d8c8e9] text-[#6a5182] hover:bg-[#f3eff7]'}`}
              >
                Today Schedule
              </button>
            </div>
            {activeTab === 'today' && (
              <button
                onClick={openTodayEditor}
                className="inline-flex items-center justify-center gap-2 bg-white border border-[#d8c8e9] hover:bg-[#f3eff7] text-[#6a5182] text-[13px] font-bold px-4 py-2 rounded-sm transition-all cursor-pointer"
              >
                Edit Today
              </button>
            )}
            {activeTab === 'weekly' && (
              <button
                onClick={openWeeklyEditor}
                className="inline-flex items-center justify-center gap-2 bg-white border border-[#d8c8e9] hover:bg-[#f3eff7] text-[#6a5182] text-[13px] font-bold px-4 py-2 rounded-sm transition-all cursor-pointer"
              >
                Edit Weekly
              </button>
            )}
          </div>

          {activeTab === 'weekly' ? (
            <div className="divide-y divide-[#edf2f7]">
              {deleteError && (
                <div className="m-5 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                  {deleteError}
                </div>
              )}
              {DAYS_OF_WEEK.map((day) => {
                const dayEntries = weeklyMap[day] ?? [];
                const isToday = day === todayDay;

                return (
                  <div key={day} className={`grid grid-cols-1 lg:grid-cols-[170px_1fr] ${isToday ? 'bg-[#fbf8fe]' : 'bg-white'}`}>
                    <div className="p-5 border-b lg:border-b-0 lg:border-r border-[#edf2f7] flex lg:flex-col items-center lg:items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[15px] font-extrabold text-[#4b3f68]">{day}</h3>
                        {isToday && <p className="text-[11px] font-bold text-[#6a5182] mt-1 uppercase tracking-wide">Today</p>}
                      </div>
                      <span className="rounded-sm bg-white border border-[#e2d9ed] px-2.5 py-1 text-[11px] font-bold text-[#64748b]">
                        {dayEntries.length}
                      </span>
                    </div>
                    <div className="p-5">
                      {dayEntries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {dayEntries.map(renderScheduleCard)}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6 bg-[#f8fafc] rounded-sm border border-dashed border-[#cbd5e1] text-center min-h-[96px]">
                          <span className="text-[13.5px] font-medium text-[#64748b]">No weekly classes scheduled for {day}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5">
              {deleteError && (
                <div className="mb-5 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                  {deleteError}
                </div>
              )}
              <div className="mb-5 rounded-sm border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-extrabold text-[#4b3f68]">{todayDay} | {new Date(`${todayDate}T00:00:00`).toLocaleDateString()}</p>
                  <p className="text-[12px] text-[#64748b] mt-1">
                    {todayUsesOverride ? 'Today has an edited schedule override.' : 'Today is currently using the weekly schedule for this day.'}
                  </p>
                </div>
                {todayUsesOverride && (
                  <button
                    onClick={clearTodayOverride}
                    disabled={isSavingToday}
                    className="self-start md:self-auto text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer disabled:opacity-60"
                  >
                    Clear Today Edit
                  </button>
                )}
              </div>

              {displayedTodayEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayedTodayEntries.map(renderScheduleCard)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-sm text-center">
                  <Calendar size={42} className="text-[#cbd5e1] mb-4" />
                  <h2 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Schedule Today</h2>
                  <p className="text-[14px] text-[#64748b] max-w-md">There is no weekly schedule for today. Use Edit Today to add a temporary schedule for today.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isWeeklyEditorOpen && (
        <AppModal onClose={() => setIsWeeklyEditorOpen(false)} widthClass="max-w-[960px]">
          <div className="bg-white rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Edit Weekly Schedule</h3>
                <p className="text-[13px] text-[#64748b] mt-1">This is the base timetable. Today will follow this unless admin edits today.</p>
              </div>
              <button
                onClick={() => setIsWeeklyEditorOpen(false)}
                className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {weeklyDrafts.map((draft, index) => (
                <div key={draft.sourceId} className="grid grid-cols-1 gap-3 rounded-sm border border-[#e2e8f0] bg-[#f8fafc] p-3 md:grid-cols-2 xl:grid-cols-3">
                  <select
                    value={draft.course_id}
                    onChange={(event) => updateWeeklyDraft(index, 'course_id', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  >
                    <option value="">Select course</option>
                    {batchCourseOptions.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                  </select>
                  <select
                    value={draft.teacher_id}
                    onChange={(event) => updateWeeklyDraft(index, 'teacher_id', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  >
                    <option value="">Select teacher</option>
                    {teacherOptions.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                  </select>
                  <select
                    value={draft.day_of_week || todayDay}
                    onChange={(event) => updateWeeklyDraft(index, 'day_of_week', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  >
                    {DAYS_OF_WEEK.map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                  <input
                    type="time"
                    value={draft.start_time}
                    onChange={(event) => updateWeeklyDraft(index, 'start_time', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <input
                    type="time"
                    value={draft.end_time}
                    onChange={(event) => updateWeeklyDraft(index, 'end_time', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <input
                    type="text"
                    value={draft.room}
                    onChange={(event) => updateWeeklyDraft(index, 'room', event.target.value)}
                    placeholder="Room"
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <input
                    type="text"
                    value={draft.notes}
                    onChange={(event) => updateWeeklyDraft(index, 'notes', event.target.value)}
                    placeholder="Lecture, lab, etc."
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <button
                    type="button"
                    onClick={() => removeWeeklyDraft(index)}
                    className="justify-self-start px-3 py-2 text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {weeklyDrafts.length === 0 && (
                <div className="rounded-sm border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center text-[13px] font-semibold text-[#64748b]">
                  No weekly rows yet. Add a row to start building the week.
                </div>
              )}

              <button
                type="button"
                onClick={addWeeklyDraft}
                className="self-start px-4 py-2 bg-white border border-[#d8c8e9] text-[#6a5182] text-[13px] font-bold rounded-sm hover:bg-[#f3eff7] cursor-pointer"
              >
                Add Weekly Row
              </button>

              {weeklyError && (
                <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                  {weeklyError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsWeeklyEditorOpen(false)}
                disabled={isSavingWeekly}
                className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveWeeklySchedule}
                disabled={isSavingWeekly}
                className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingWeekly && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isSavingWeekly ? 'Saving...' : 'Save Weekly'}
              </button>
            </div>
          </div>
        </AppModal>
      )}

      {isTodayEditorOpen && (
        <AppModal onClose={() => setIsTodayEditorOpen(false)} widthClass="max-w-[900px]">
          <div className="bg-white rounded-md shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] bg-[#fbf8fe] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-extrabold text-[#0d3349] tracking-tight">Edit Today Schedule</h3>
                <p className="text-[13px] text-[#64748b] mt-1">Starts from today&apos;s weekly schedule, then saves changes only for today.</p>
              </div>
              <button
                onClick={() => setIsTodayEditorOpen(false)}
                className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer p-1"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {todayDrafts.map((draft, index) => (
                <div key={draft.sourceId} className="grid grid-cols-1 gap-3 rounded-sm border border-[#e2e8f0] bg-[#f8fafc] p-3 md:grid-cols-2 xl:grid-cols-3">
                  <select
                    value={draft.course_id}
                    onChange={(event) => updateTodayDraft(index, 'course_id', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  >
                    <option value="">Select course</option>
                    {batchCourseOptions.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                  </select>
                  <select
                    value={draft.teacher_id}
                    onChange={(event) => updateTodayDraft(index, 'teacher_id', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  >
                    <option value="">Select teacher</option>
                    {teacherOptions.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                  </select>
                  <input
                    type="time"
                    value={draft.start_time}
                    onChange={(event) => updateTodayDraft(index, 'start_time', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <input
                    type="time"
                    value={draft.end_time}
                    onChange={(event) => updateTodayDraft(index, 'end_time', event.target.value)}
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <input
                    type="text"
                    value={draft.room}
                    onChange={(event) => updateTodayDraft(index, 'room', event.target.value)}
                    placeholder="Room"
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <input
                    type="text"
                    value={draft.notes}
                    onChange={(event) => updateTodayDraft(index, 'notes', event.target.value)}
                    placeholder="Reason or note"
                    className="bg-white border border-[#cbd5e1] rounded-sm px-3 py-2 text-[13px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 text-[#1e293b]"
                  />
                  <button
                    type="button"
                    onClick={() => removeTodayDraft(index)}
                    className="justify-self-start px-3 py-2 text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addTodayDraft}
                className="self-start px-4 py-2 bg-white border border-[#d8c8e9] text-[#6a5182] text-[13px] font-bold rounded-sm hover:bg-[#f3eff7] cursor-pointer"
              >
                Add Row
              </button>

              {todayError && (
                <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                  {todayError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fbf8fe] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTodayEditorOpen(false)}
                disabled={isSavingToday}
                className="px-5 py-2.5 bg-white border border-[#e2d9ed] text-[#4b3f68] text-[13.5px] font-semibold rounded-sm hover:bg-[#f3eff7] transition-all cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTodayOverride}
                disabled={isSavingToday}
                className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSavingToday && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {isSavingToday ? 'Saving...' : 'Save Today'}
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </>
  );
}
