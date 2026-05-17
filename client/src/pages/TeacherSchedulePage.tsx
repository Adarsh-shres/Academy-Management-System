import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, MapPin, Users } from '../components/shared/icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { isMissingTeacherSchedulesTable } from '../lib/supabaseErrors';
import { SchedulePageSkeleton } from '../components/skeletons/PageSkeletons';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type AssignedClassRow = {
  id?: string;
  name?: string | null;
  room?: string | null;
  batches?: {
    name?: string | null;
    code?: string | null;
  } | null;
};

type TeacherScheduleRow = {
  id: string;
  teacher_id: string;
  class_id?: string | null;
  schedule_type: 'weekly' | 'one_time';
  day_of_week?: string | null;
  schedule_date?: string | null;
  start_time: string;
  end_time: string;
  title: string;
  room?: string | null;
  notes?: string | null;
  is_cancelled?: boolean | null;
};

type ClassScheduleRow = {
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
  classes?: AssignedClassRow | null;
  courses?: {
    name?: string | null;
    course_code?: string | null;
  } | null;
};

type TeacherScheduleEntry = TeacherScheduleRow & {
  className: string;
  classLabel: string;
  source: 'class' | 'teacher';
};

function trimTime(value?: string | null) {
  if (!value) return 'Time not set';
  return value.slice(0, 5);
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sortByTime(entries: TeacherScheduleEntry[]) {
  return [...entries].sort((a, b) => `${a.start_time}${a.end_time}`.localeCompare(`${b.start_time}${b.end_time}`));
}

function formatDate(value?: string | null) {
  if (!value) return 'Selected day';
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function classLabelForRow(classRow?: AssignedClassRow | null) {
  if (!classRow) return 'Independent teaching block';
  const batch = classRow.batches?.code?.trim() || classRow.batches?.name?.trim();
  return batch ? `${classRow.name?.trim() || 'Class'} | ${batch}` : (classRow.name?.trim() || 'Class');
}

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TeacherScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = getLocalDateString();

  const loadSchedule = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');

    const [classResult, teacherScheduleResult, classScheduleResult] = await Promise.all([
      supabase
        .from('classes')
        .select('id, name, room, batches(name, code)')
        .or(`teacher_id.eq.${user.id},teacher_ids.cs.{${user.id}}`)
        .order('name', { ascending: true }),
      supabase
        .from('teacher_schedules')
        .select('id, teacher_id, class_id, schedule_type, day_of_week, schedule_date, start_time, end_time, title, room, notes, is_cancelled')
        .eq('teacher_id', user.id)
        .order('schedule_type', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true }),
      supabase
        .from('class_schedules')
        .select('id, class_id, course_id, teacher_id, schedule_type, day_of_week, schedule_date, start_time, end_time, room, notes, classes(name, room, batches(name, code)), courses(name, course_code)')
        .eq('teacher_id', user.id)
        .order('schedule_type', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true }),
    ]);

    if (classResult.error) {
      setError(classResult.error.message);
      setEntries([]);
      setIsLoading(false);
      return;
    }

    if (classScheduleResult.error) {
      setError(classScheduleResult.error.message);
      setEntries([]);
      setIsLoading(false);
      return;
    }

    const classes = (classResult.data as AssignedClassRow[] | null) ?? [];
    const classMap = new Map(classes.map((classRow) => [classRow.id, classRow]));

    const classScheduleEntries: TeacherScheduleEntry[] = ((classScheduleResult.data as ClassScheduleRow[] | null) ?? []).map((entry) => ({
      id: `class-${entry.id}`,
      teacher_id: user.id,
      class_id: entry.class_id,
      schedule_type: entry.schedule_type,
      day_of_week: entry.day_of_week,
      schedule_date: entry.schedule_date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      title: entry.courses?.name?.trim() || entry.courses?.course_code?.trim() || entry.classes?.name?.trim() || 'Class schedule',
      room: entry.room || entry.classes?.room || null,
      notes: entry.notes,
      is_cancelled: false,
      className: classLabelForRow(entry.classes ?? classMap.get(entry.class_id)),
      classLabel: entry.classes?.name?.trim() || classMap.get(entry.class_id)?.name?.trim() || 'Class',
      source: 'class',
    }));

    const teacherScheduleEntries: TeacherScheduleEntry[] = teacherScheduleResult.error
      ? []
      : ((teacherScheduleResult.data as TeacherScheduleRow[] | null) ?? [])
        .filter((entry) => !entry.is_cancelled)
        .map((entry) => ({
          ...entry,
          className: classLabelForRow(entry.class_id ? classMap.get(entry.class_id) : null),
          classLabel: entry.class_id ? (classMap.get(entry.class_id)?.name?.trim() || 'Class') : 'Independent teaching block',
          source: 'teacher',
        }));

    if (teacherScheduleResult.error && !isMissingTeacherSchedulesTable(teacherScheduleResult.error)) {
      setError(teacherScheduleResult.error.message);
      setEntries(classScheduleEntries);
      setIsLoading(false);
      return;
    }

    setEntries(sortByTime([...classScheduleEntries, ...teacherScheduleEntries]));
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const todaysEntries = useMemo(
    () => sortByTime(entries.filter((entry) => (
      (entry.schedule_type === 'weekly' && entry.day_of_week === todayDay)
      || (entry.schedule_type === 'one_time' && entry.schedule_date === todayDate)
    ))),
    [entries, todayDate, todayDay],
  );

  const weeklyEntries = useMemo(
    () => sortByTime(entries.filter((entry) => entry.schedule_type === 'weekly')),
    [entries],
  );

  const oneTimeEntries = useMemo(
    () => sortByTime(entries.filter((entry) => entry.schedule_type === 'one_time' && (!entry.schedule_date || entry.schedule_date >= todayDate))),
    [entries, todayDate],
  );

  const weeklyMap = useMemo(() => {
    const map: Record<string, TeacherScheduleEntry[]> = {};
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

  const renderEntry = (entry: TeacherScheduleEntry, compact = false) => (
    <div key={entry.id} className={`${compact ? 'border-l-[3px] border-[#6a5182] bg-[#fbf8fe]' : 'border border-[#e2d9ed] bg-white'} rounded-sm p-4`}>
      <div className="flex justify-between items-start gap-3 mb-3">
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-[#e0f2fe] text-[#0284c7]">
          {trimTime(entry.start_time)}{entry.end_time ? ` - ${trimTime(entry.end_time)}` : ''}
        </span>
        <span className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold px-2 py-0.5 rounded-sm">
          {entry.schedule_type === 'weekly' ? entry.day_of_week : formatDate(entry.schedule_date)}
        </span>
      </div>
      <h4 className="text-[15px] font-bold text-[#4b3f68] mb-1 leading-tight">{entry.title}</h4>
      <p className="text-[12px] font-semibold text-[#64748b] mb-3">{entry.className}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-[#475569]">
        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#94a3b8]" /> {entry.room || 'Room not set'}</span>
        <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {entry.classLabel}</span>
      </div>
      {entry.notes && <p className="text-[12px] text-[#475569] mt-3">{entry.notes}</p>}
    </div>
  );

  if (isLoading) {
    return <SchedulePageSkeleton />;
  }

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">Teacher Schedule</h1>
          <p className="text-[#64748b] font-medium mt-1">View-only timetable for assigned class sessions across batches.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          Could not load schedule: {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
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
                  <p className="text-[13.5px] font-bold text-[#4b3f68]">No teaching sessions today</p>
                  <p className="text-[12.5px] text-[#64748b] mt-1">Assigned class sessions for today will appear here.</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
            <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe]">
              <h2 className="text-[16px] font-extrabold text-[#4b3f68]">One-Time Schedule</h2>
              <p className="text-[12.5px] text-[#64748b] font-medium mt-1">{oneTimeEntries.length} upcoming date-specific sessions.</p>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {oneTimeEntries.length > 0 ? (
                oneTimeEntries.map((entry) => renderEntry(entry))
              ) : (
                <p className="text-[13px] font-semibold text-[#64748b] rounded-sm border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center">
                  No upcoming one-time sessions scheduled.
                </p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
            <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#4b3f68]">Weekly Schedule</h2>
                <p className="text-[12.5px] text-[#64748b] font-medium mt-1">Recurring sessions from Sunday through Friday.</p>
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
                          <span className="text-[13.5px] font-medium text-[#64748b]">No sessions scheduled for {day}.</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
      </div>
    </div>
  );
}
