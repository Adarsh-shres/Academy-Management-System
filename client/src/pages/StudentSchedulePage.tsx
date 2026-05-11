import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, MapPin, Users } from '../components/shared/icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type ClassRow = {
  id?: string;
  name?: string | null;
  room?: string | null;
  batches?: {
    name?: string | null;
    code?: string | null;
  } | null;
};

type ScheduleRow = {
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
  classes?: ClassRow | ClassRow[] | null;
  courses?: {
    name?: string | null;
    course_code?: string | null;
  } | Array<{ name?: string | null; course_code?: string | null }> | null;
  users?: {
    name?: string | null;
  } | Array<{ name?: string | null }> | null;
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function trimTime(value?: string | null) {
  return value ? value.slice(0, 5) : '';
}

function formatDate(value?: string | null) {
  if (!value) return 'Selected date';
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function sortByTime(entries: ScheduleRow[]) {
  return [...entries].sort((a, b) => `${a.start_time}${a.end_time}`.localeCompare(`${b.start_time}${b.end_time}`));
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function StudentSchedulePage() {
  const { user } = useAuth();
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = getLocalDateString();

  const loadSchedule = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');

    const { data: classRows, error: classError } = await supabase
      .from('classes')
      .select('id')
      .contains('student_ids', [user.id]);

    if (classError) {
      setError(classError.message);
      setScheduleEntries([]);
      setIsLoading(false);
      return;
    }

    const classIds = ((classRows as Array<{ id: string }> | null) ?? []).map((row) => row.id);
    if (classIds.length === 0) {
      setScheduleEntries([]);
      setIsLoading(false);
      return;
    }

    const { data: scheduleRows, error: scheduleError } = await supabase
      .from('class_schedules')
      .select('id, class_id, course_id, teacher_id, schedule_type, day_of_week, schedule_date, start_time, end_time, room, notes, classes(name, room, batches(name, code)), courses(name, course_code), users(name)')
      .in('class_id', classIds)
      .order('schedule_type', { ascending: true })
      .order('day_of_week', { ascending: true })
      .order('schedule_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (scheduleError) {
      setError(scheduleError.message);
      setScheduleEntries([]);
      setIsLoading(false);
      return;
    }

    setScheduleEntries((scheduleRows as unknown as ScheduleRow[] | null) ?? []);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const todaysEntries = useMemo(
    () => sortByTime(scheduleEntries.filter((entry) => (
      (entry.schedule_type === 'weekly' && entry.day_of_week === todayDay)
      || (entry.schedule_type === 'one_time' && entry.schedule_date === todayDate)
    ))),
    [scheduleEntries, todayDate, todayDay],
  );

  const weeklyEntries = useMemo(
    () => sortByTime(scheduleEntries.filter((entry) => entry.schedule_type === 'weekly')),
    [scheduleEntries],
  );

  const oneTimeEntries = useMemo(
    () => sortByTime(scheduleEntries.filter((entry) => entry.schedule_type === 'one_time' && (!entry.schedule_date || entry.schedule_date >= todayDate))),
    [scheduleEntries, todayDate],
  );

  const weeklyMap = useMemo(() => {
    const map: Record<string, ScheduleRow[]> = {};
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

  const renderEntry = (entry: ScheduleRow, compact = false) => {
    const course = firstRelation(entry.courses);
    const classRow = firstRelation(entry.classes);
    const teacher = firstRelation(entry.users);
    const courseLabel = course?.name || course?.course_code || 'Course not selected';
    const classLabel = classRow?.name || 'Class';
    const batchLabel = classRow?.batches?.code || classRow?.batches?.name || 'Batch';
    const teacherLabel = teacher?.name || 'Teacher not selected';

    return (
      <div key={entry.id} className={`${compact ? 'border-l-[3px] border-[#6a5182] bg-[#fbf8fe]' : 'border border-[#e2d9ed] bg-white'} rounded-sm p-4`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[#e0f2fe] text-[#0284c7]">
            {trimTime(entry.start_time)} - {trimTime(entry.end_time)}
          </span>
          <span className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-sm">
            {entry.schedule_type === 'weekly' ? entry.day_of_week : formatDate(entry.schedule_date)}
          </span>
        </div>
        <h4 className="text-[15px] font-bold text-[#4b3f68] mb-1 leading-tight">{courseLabel}</h4>
        <p className="text-[12px] font-semibold text-[#64748b] mb-3">{classLabel} | {batchLabel}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-[#475569]">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#94a3b8]" /> {entry.room || classRow?.room || 'Room not set'}</span>
          <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {teacherLabel}</span>
        </div>
        {entry.notes && <p className="text-[12px] text-[#475569] mt-3">{entry.notes}</p>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div>
        <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">My Schedule</h1>
        <p className="text-[14px] text-[#64748b] mt-1">View your assigned class schedule across all batches and courses.</p>
      </div>

      {error && (
        <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          Could not load schedule: {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="h-[220px] animate-pulse rounded-sm bg-white border border-[#e7dff0]" />
          <div className="h-[780px] animate-pulse rounded-sm bg-white border border-[#e7dff0]" />
        </div>
      ) : (
        <>
          <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
            <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarCheck2 size={18} className="text-[#6a5182]" />
                  <h2 className="text-[16px] font-extrabold text-[#4b3f68]">Today Schedule</h2>
                </div>
                <p className="text-[12.5px] text-[#64748b] font-medium mt-1">{todayDay}</p>
              </div>
              <span className="rounded-sm bg-white border border-[#e2d9ed] px-2.5 py-1 text-[12px] font-bold text-[#64748b]">
                {todaysEntries.length}
              </span>
            </div>

            <div className="p-5 flex flex-col gap-3.5">
              {todaysEntries.length > 0 ? (
                todaysEntries.map((entry) => renderEntry(entry, true))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-[#f8fafc] rounded-sm text-center border border-dashed border-[#cbd5e1] min-h-[180px]">
                  <p className="text-[13.5px] font-bold text-[#4b3f68]">No classes today</p>
                  <p className="text-[12.5px] text-[#64748b] mt-1">Your scheduled classes for today will appear here.</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
            <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe]">
              <h2 className="text-[16px] font-extrabold text-[#4b3f68]">One-Time Schedule</h2>
              <p className="text-[12.5px] text-[#64748b] font-medium mt-1">{oneTimeEntries.length} upcoming date-specific classes.</p>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {oneTimeEntries.length > 0 ? (
                oneTimeEntries.map((entry) => renderEntry(entry))
              ) : (
                <p className="text-[13px] font-semibold text-[#64748b] rounded-sm border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center">
                  No upcoming one-time classes scheduled.
                </p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
            <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#4b3f68]">Weekly Schedule</h2>
                <p className="text-[12.5px] text-[#64748b] font-medium mt-1">Recurring classes from Sunday through Friday.</p>
              </div>
              <span className="rounded-sm bg-white border border-[#e2d9ed] px-3 py-2 text-[12px] font-bold text-[#64748b]">
                {weeklyEntries.length} {weeklyEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

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
                          {dayEntries.map((entry) => renderEntry(entry))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-6 bg-[#f8fafc] rounded-sm border border-dashed border-[#cbd5e1] text-center min-h-[96px]">
                          <span className="text-[13.5px] font-medium text-[#64748b]">No classes scheduled for {day}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
