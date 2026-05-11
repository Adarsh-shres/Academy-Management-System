import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users } from '../components/shared/icons';
import { supabase } from '../lib/supabase';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type TeacherProfile = {
  id: string;
  name?: string | null;
};

type TeacherScheduleRow = {
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
  classes?: {
    name?: string | null;
    room?: string | null;
    batches?: {
      name?: string | null;
      code?: string | null;
    } | null;
  } | null;
  courses?: {
    name?: string | null;
    course_code?: string | null;
  } | null;
};

function trimTime(value?: string | null) {
  return value ? value.slice(0, 5) : '';
}

function sortByTime(entries: TeacherScheduleRow[]) {
  return [...entries].sort((a, b) => `${a.start_time}${a.end_time}`.localeCompare(`${b.start_time}${b.end_time}`));
}

export default function AdminTeacherSchedulePage() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [scheduleEntries, setScheduleEntries] = useState<TeacherScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeacherSchedule = useCallback(async () => {
    if (!teacherId) return;

    setIsLoading(true);
    setError('');

    const [teacherResult, scheduleResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, name')
        .eq('id', teacherId)
        .eq('role', 'teacher')
        .maybeSingle(),
      supabase
        .from('class_schedules')
        .select('id, class_id, course_id, teacher_id, schedule_type, day_of_week, schedule_date, start_time, end_time, room, notes, classes(name, room, batches(name, code)), courses(name, course_code)')
        .eq('teacher_id', teacherId)
        .order('schedule_type', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true }),
    ]);

    if (teacherResult.error || !teacherResult.data) {
      setError(teacherResult.error?.message || 'Teacher not found.');
      setTeacher(null);
      setScheduleEntries([]);
      setIsLoading(false);
      return;
    }

    if (scheduleResult.error) {
      setError(scheduleResult.error.message);
      setTeacher(teacherResult.data as TeacherProfile);
      setScheduleEntries([]);
      setIsLoading(false);
      return;
    }

    setTeacher(teacherResult.data as TeacherProfile);
    setScheduleEntries((scheduleResult.data as TeacherScheduleRow[] | null) ?? []);
    setIsLoading(false);
  }, [teacherId]);

  useEffect(() => {
    void loadTeacherSchedule();
  }, [loadTeacherSchedule]);

  const weeklyMap = useMemo(() => {
    const map: Record<string, TeacherScheduleRow[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      map[day] = [];
    });

    scheduleEntries
      .filter((entry) => entry.schedule_type === 'weekly')
      .forEach((entry) => {
        if (entry.day_of_week && map[entry.day_of_week]) {
          map[entry.day_of_week].push(entry);
        }
      });

    DAYS_OF_WEEK.forEach((day) => {
      map[day] = sortByTime(map[day]);
    });

    return map;
  }, [scheduleEntries]);

  const oneTimeEntries = useMemo(
    () => sortByTime(scheduleEntries.filter((entry) => entry.schedule_type === 'one_time')),
    [scheduleEntries],
  );

  const renderEntry = (entry: TeacherScheduleRow) => {
    const batchLabel = entry.classes?.batches?.code || entry.classes?.batches?.name || 'Batch';
    const courseLabel = entry.courses?.name || entry.courses?.course_code || 'Course not selected';
    const classLabel = entry.classes?.name || 'Class';

    return (
      <div key={entry.id} className="rounded-sm border border-[#e2d9ed] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[#e0f2fe] text-[#0284c7]">
            {trimTime(entry.start_time)} - {trimTime(entry.end_time)}
          </span>
          <span className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-sm">
            {batchLabel}
          </span>
        </div>
        <h4 className="mt-3 text-[15px] font-bold text-[#4b3f68]">{courseLabel}</h4>
        <p className="mt-1 text-[12.5px] font-semibold text-[#64748b]">{classLabel}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-[#475569]">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#94a3b8]" /> {entry.room || entry.classes?.room || 'Room not set'}</span>
          <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {teacher?.name || 'Teacher'}</span>
        </div>
        {entry.notes && <p className="mt-3 text-[12px] text-[#475569]">{entry.notes}</p>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d9ed] border-t-[#6a5182] rounded-full animate-spin"></div>
        <p className="text-[14px] text-[#64748b] font-medium">Loading teacher schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-[14px] text-[#ef4444] font-semibold">Unable to load teacher schedule</p>
        <p className="max-w-md text-center text-[13px] text-[#64748b]">{error}</p>
        <button onClick={() => navigate('/schedule')} className="mt-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer">
          Back to Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <button
          onClick={() => navigate('/schedule')}
          className="mb-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Schedule
        </button>
        <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">{teacher?.name || 'Teacher'} Schedule</h1>
        <p className="mt-1 text-[14px] text-[#64748b]">Class sessions assigned to this teacher across all batches.</p>
      </div>

      <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
          <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Weekly Schedule</h2>
        </div>
        <div className="divide-y divide-[#edf2f7]">
          {DAYS_OF_WEEK.map((day) => {
            const dayEntries = weeklyMap[day] ?? [];
            return (
              <div key={day} className="grid grid-cols-1 lg:grid-cols-[170px_1fr]">
                <div className="p-5 border-b lg:border-b-0 lg:border-r border-[#edf2f7] flex lg:flex-col items-center lg:items-start justify-between gap-3">
                  <h3 className="text-[15px] font-extrabold text-[#4b3f68]">{day}</h3>
                  <span className="rounded-sm bg-white border border-[#e2d9ed] px-2.5 py-1 text-[11px] font-bold text-[#64748b]">
                    {dayEntries.length}
                  </span>
                </div>
                <div className="p-5">
                  {dayEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {dayEntries.map(renderEntry)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-[#f8fafc] rounded-sm border border-dashed border-[#cbd5e1] text-center min-h-[96px]">
                      <span className="text-[13.5px] font-medium text-[#64748b]">No scheduled classes for {day}.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
          <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">One-Day Schedule</h2>
        </div>
        <div className="p-5">
          {oneTimeEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {oneTimeEntries.map(renderEntry)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 px-4 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-sm text-center">
              <Calendar size={42} className="text-[#cbd5e1] mb-4" />
              <h3 className="text-[17px] font-bold text-[#4b3f68] mb-1">No One-Day Entries</h3>
              <p className="text-[13px] text-[#64748b] max-w-md">One-day schedule changes assigned to this teacher will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
