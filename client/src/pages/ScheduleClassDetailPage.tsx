import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users } from '../components/shared/icons';
import AppModal from '../components/shared/AppModal';
import { supabase } from '../lib/supabase';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type CourseClass = {
  id: string;
  name?: string | null;
  teacher_id?: string | null;
  room?: string | null;
  student_ids?: string[] | null;
  courses?: {
    name?: string | null;
    course_code?: string | null;
  } | null;
};

type ScheduleEntry = {
  id: string;
  class_id: string;
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

function makeDraft(entry: ScheduleEntry): TodayDraft {
  return {
    sourceId: entry.id,
    start_time: trimTime(entry.start_time),
    end_time: trimTime(entry.end_time),
    room: entry.room ?? '',
    notes: entry.notes ?? '',
  };
}

export default function ScheduleClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [courseClass, setCourseClass] = useState<CourseClass | null>(null);
  const [teacherName, setTeacherName] = useState('');
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

  const loadClassSchedule = useCallback(async () => {
    if (!classId) return;

    setIsLoading(true);
    setError('');

    const { data: classRow, error: classError } = await supabase
      .from('classes')
      .select('id, name, teacher_id, room, student_ids, courses(name, course_code)')
      .eq('id', classId)
      .maybeSingle();

    if (classError || !classRow) {
      setError(classError?.message || 'Class not found.');
      setIsLoading(false);
      return;
    }

    const nextClass = classRow as CourseClass;
    setCourseClass(nextClass);

    if (nextClass.teacher_id) {
      const { data: teacherRow } = await supabase
        .from('users')
        .select('name')
        .eq('id', nextClass.teacher_id)
        .maybeSingle();

      setTeacherName((teacherRow as { name?: string } | null)?.name || 'Assigned Teacher');
    } else {
      setTeacherName('No teacher assigned');
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
    setTodayDrafts(sourceEntries.map(makeDraft));
    setTodayError('');
    setIsTodayEditorOpen(true);
  };

  const openWeeklyEditor = () => {
    setWeeklyDrafts(weeklyEntries.map((entry) => ({
      ...makeDraft(entry),
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
      start_time: '',
      end_time: '',
      room: courseClass?.room ?? '',
      notes: '',
    }]);
  };

  const addWeeklyDraft = () => {
    setWeeklyDrafts((prev) => [...prev, {
      sourceId: `new-weekly-${Date.now()}`,
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

    const invalidDraft = weeklyDrafts.find((draft) => !draft.day_of_week || !draft.start_time || !draft.end_time || draft.end_time <= draft.start_time);
    if (invalidDraft) {
      setWeeklyError('Each weekly row needs a day plus valid start and end times.');
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

    const invalidDraft = todayDrafts.find((draft) => !draft.start_time || !draft.end_time || draft.end_time <= draft.start_time);
    if (invalidDraft) {
      setTodayError('Each today schedule row needs a valid start and end time.');
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

  const renderScheduleCard = (entry: ScheduleEntry) => (
    <div key={entry.id} className="rounded-sm border border-[#e2d9ed] bg-white p-4">
      <div className="flex justify-between items-start gap-3">
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[#e0f2fe] text-[#0284c7]">
          {formatEntry(entry)}
        </span>
        <span className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-sm">
          {courseClass.courses?.course_code || 'CRS'}
        </span>
      </div>
      <h4 className="text-[15px] font-bold text-[#4b3f68] mt-3">{courseClass.courses?.name || 'Course'}</h4>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-[#475569] mt-3">
        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#94a3b8]" /> {entry.room || courseClass.room || 'Room not set'}</span>
        <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {courseClass.student_ids?.length ?? 0}</span>
      </div>
      {entry.notes && <p className="text-[12px] text-[#475569] mt-3">{entry.notes}</p>}
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
            <p className="text-[14px] text-[#64748b] mt-1">{courseClass.courses?.name || 'Course'} | {teacherName}</p>
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
                <div key={draft.sourceId} className="grid grid-cols-1 lg:grid-cols-[130px_120px_120px_1fr_1fr_auto] gap-3 rounded-sm border border-[#e2e8f0] bg-[#f8fafc] p-3">
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
                    className="px-3 py-2 text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer"
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
                <div key={draft.sourceId} className="grid grid-cols-1 lg:grid-cols-[120px_120px_1fr_1fr_auto] gap-3 rounded-sm border border-[#e2e8f0] bg-[#f8fafc] p-3">
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
                    className="px-3 py-2 text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer"
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
