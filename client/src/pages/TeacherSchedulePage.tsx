import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CalendarCheck2, MapPin, Users } from '../components/shared/icons';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type AssignedClassRow = {
  id: string;
  name?: string | null;
  room?: string | null;
  batches?: {
    name?: string | null;
    code?: string | null;
  } | null;
};

type TeacherScheduleEntry = {
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
  className: string;
  classLabel: string;
  dateLabel: string;
};

function trimTime(value?: string | null) {
  if (!value) return 'Time not set';
  return value.slice(0, 5);
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
  const [noScheduleAssigned, setNoScheduleAssigned] = useState(false);
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const loadSchedule = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');
    setNoScheduleAssigned(false);

    try {
      // Step 1: Get classes assigned to this teacher
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, room, batches(name, code)')
        .or(`teacher_id.eq.${user.id},teacher_ids.cs.{${user.id}}`)
        .order('name', { ascending: true });

      if (classError) {
        setError(classError.message);
        setEntries([]);
        setIsLoading(false);
        return;
      }

      const classes = (classData as AssignedClassRow[] | null) ?? [];
      const classMap = new Map(classes.map((c) => [c.id, c]));
      const classIds = classes.map((c) => c.id);

      console.log('schedule debug — teacher classes:', classes.length, classIds);

      // Step 2: Try teacher_schedules first
      const { data: tsData, error: tsError } = await supabase
        .from('teacher_schedules')
        .select('*')
        .eq('teacher_id', user.id)
        .order('start_time', { ascending: true });

      console.log('schedule data (teacher_schedules):', tsData, 'error:', tsError);

      // If teacher_schedules exists and has data, use it
      if (!tsError && tsData && tsData.length > 0) {
        const mapped = tsData
          .filter((row: any) => !row.is_cancelled)
          .map((row: any) => {
            const classRow = row.class_id ? classMap.get(row.class_id) : null;
            return {
              id: row.id,
              teacher_id: row.teacher_id,
              class_id: row.class_id ?? null,
              schedule_type: row.schedule_type ?? 'weekly',
              day_of_week: row.day_of_week ?? null,
              schedule_date: row.schedule_date ?? null,
              start_time: row.start_time,
              end_time: row.end_time,
              title: row.title || classRow?.name?.trim() || 'Teaching Block',
              room: row.room || classRow?.room || null,
              notes: row.notes ?? null,
              is_cancelled: row.is_cancelled ?? false,
              className: classLabelForRow(classRow),
              classLabel: classRow?.name?.trim() || 'Independent teaching block',
              dateLabel: (row.schedule_type ?? 'weekly') === 'weekly'
                ? (row.day_of_week || 'Weekly')
                : formatDate(row.schedule_date),
            } as TeacherScheduleEntry;
          });

        setEntries(mapped);
        setIsLoading(false);
        return;
      }

      // Step 3: Fallback — fetch from class_schedules for this teacher's classes
      if (classIds.length === 0) {
        setNoScheduleAssigned(true);
        setEntries([]);
        setIsLoading(false);
        return;
      }

      const { data: csData, error: csError } = await supabase
        .from('class_schedules')
        .select('*')
        .in('class_id', classIds)
        .order('start_time', { ascending: true });

      console.log('schedule data (class_schedules):', csData, 'error:', csError);

      if (csError) {
        setError(csError.message);
        setEntries([]);
        setIsLoading(false);
        return;
      }

      if (!csData || csData.length === 0) {
        setNoScheduleAssigned(true);
        setEntries([]);
        setIsLoading(false);
        return;
      }

      const mapped = csData.map((row: any) => {
        const classRow = classMap.get(row.class_id);
        return {
          id: `class-${row.id}`,
          teacher_id: user.id,
          class_id: row.class_id,
          schedule_type: row.schedule_type ?? 'weekly',
          day_of_week: row.day_of_week ?? null,
          schedule_date: row.schedule_date ?? null,
          start_time: row.start_time,
          end_time: row.end_time,
          title: classRow?.name?.trim() || 'Class schedule',
          room: row.room || classRow?.room || null,
          notes: row.notes ?? null,
          is_cancelled: false,
          className: classLabelForRow(classRow),
          classLabel: classRow?.name?.trim() || 'Class',
          dateLabel: (row.schedule_type ?? 'weekly') === 'weekly'
            ? (row.day_of_week || 'Weekly')
            : formatDate(row.schedule_date),
        } as TeacherScheduleEntry;
      });

      setEntries(mapped);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setEntries([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const todaysEntries = useMemo(
    () => sortByTime(entries.filter((entry) =>
      (entry.schedule_type === 'weekly' || !entry.schedule_type) &&
      entry.day_of_week?.toLowerCase() === todayDay.toLowerCase()
    )),
    [entries, todayDay],
  );

  const weeklyEntries = useMemo(
    () => sortByTime(entries.filter((entry) => entry.schedule_type === 'weekly')),
    [entries],
  );

  const weeklyMap = useMemo(() => {
    const map: Record<string, TeacherScheduleEntry[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      map[day] = [];
    });

    weeklyEntries.forEach((entry) => {
      const dayKey = DAYS_OF_WEEK.find((d) => d.toLowerCase() === entry.day_of_week?.toLowerCase());
      if (dayKey && map[dayKey]) {
        map[dayKey].push(entry);
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
    </div>
  );

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">Teacher Schedule</h1>
          <p className="text-[#64748b] font-medium mt-1">Your assigned schedule from the admin. View your weekly and daily teaching blocks.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          Could not load schedule: {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="h-[200px] animate-pulse rounded-sm bg-white border border-[#e7dff0]" />
          <div className="h-[400px] animate-pulse rounded-sm bg-white border border-[#e7dff0]" />
        </div>
      ) : (
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
                    <p className="text-[13.5px] font-bold text-[#4b3f68]">No teaching blocks today</p>
                    <p className="text-[12.5px] text-[#64748b] mt-1">{noScheduleAssigned ? 'No schedule has been assigned by admin yet.' : `No blocks scheduled for ${todayDay}.`}</p>
                  </div>
                )}
              </div>
            </section>



            <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
              <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-[16px] font-extrabold text-[#4b3f68]">Weekly Schedule</h2>
                  <p className="text-[12.5px] text-[#64748b] font-medium mt-1">{noScheduleAssigned ? 'No schedule has been assigned by admin yet.' : 'Recurring teaching blocks from Sunday through Friday.'}</p>
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
                            <span className="text-[13.5px] font-medium text-[#64748b]">No teacher blocks scheduled for {day}.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
        </div>
      )}
    </div>
  );
}
