/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users } from '../components/shared/icons';
import { useCourses } from '../context/CourseContext';
import { supabase } from '../lib/supabase';

type BatchClass = {
  id: string;
  batch_id?: string | null;
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
  schedule_type: 'weekly' | 'one_time';
  day_of_week?: string | null;
  schedule_date?: string | null;
  start_time: string;
  end_time: string;
  room?: string | null;
  notes?: string | null;
};

type TeacherProfile = {
  id: string;
  name?: string | null;
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

function teacherIdsForClass(classRow: BatchClass) {
  return Array.from(new Set([...(classRow.teacher_ids ?? []), ...(classRow.teacher_id ? [classRow.teacher_id] : [])]));
}

function sortByTime(entries: ScheduleEntry[]) {
  return [...entries].sort((a, b) => `${a.start_time}${a.end_time}`.localeCompare(`${b.start_time}${b.end_time}`));
}

export default function SchedulePage() {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const [classes, setClasses] = useState<BatchClass[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [scheduleTarget, setScheduleTarget] = useState<'class' | 'teacher'>('class');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedTeacherClassId, setSelectedTeacherClassId] = useState('');

  const loadScheduleOverview = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const [classResult, teacherResult] = await Promise.all([
      supabase
        .from('classes')
        .select('id, batch_id, name, teacher_id, teacher_ids, room, student_ids, batches(name, code, course_ids)')
        .not('batch_id', 'is', null)
        .order('name', { ascending: true }),
      supabase
        .from('users')
        .select('id, name')
        .eq('role', 'teacher')
        .order('name', { ascending: true }),
    ]);

    if (classResult.error) {
      setError(classResult.error.message);
      setIsLoading(false);
      return;
    }

    if (teacherResult.error) {
      setError(teacherResult.error.message);
      setTeachers([]);
      setTeacherNames({});
    } else {
      const teacherRows = (teacherResult.data as TeacherProfile[] | null) ?? [];
      const names: Record<string, string> = {};
      teacherRows.forEach((teacher) => {
        names[teacher.id] = teacher.name?.trim() || 'Unnamed Teacher';
      });
      setTeachers(teacherRows);
      setTeacherNames(names);
    }

    const nextClasses = (classResult.data as BatchClass[] | null) ?? [];
    setClasses(nextClasses);

    const classIds = nextClasses.map((courseClass) => courseClass.id);
    if (classIds.length > 0) {
      const { data: scheduleRows, error: scheduleError } = await supabase
        .from('class_schedules')
        .select('*')
        .in('class_id', classIds)
        .order('start_time', { ascending: true });

      if (scheduleError) {
        setError(scheduleError.message);
        setScheduleEntries([]);
      } else {
        setScheduleEntries((scheduleRows as ScheduleEntry[] | null) ?? []);
      }
    } else {
      setScheduleEntries([]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadScheduleOverview();
  }, [loadScheduleOverview]);

  const { dateText, day } = getToday();

  const classMap = useMemo(
    () => new Map(classes.map((courseClass) => [courseClass.id, courseClass])),
    [classes],
  );

  const courseNamesForClass = useCallback(
    (courseClass: BatchClass) => {
      const courseIds = courseClass.batches?.course_ids ?? [];
      const names = courses.filter((course) => courseIds.includes(course.id)).map((course) => course.name);
      return names.length > 0 ? names.join(', ') : 'No batch courses';
    },
    [courses],
  );

  const teacherNamesForClass = useCallback(
    (courseClass: BatchClass) => {
      const names = teacherIdsForClass(courseClass).map((teacherId) => teacherNames[teacherId]).filter(Boolean);
      return names.length > 0 ? names.join(', ') : 'No teacher assigned';
    },
    [teacherNames],
  );

  const todayOverridesByClass = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    scheduleEntries.forEach((entry) => {
      if (entry.schedule_type !== 'one_time' || entry.schedule_date !== dateText) return;
      map.set(entry.class_id, [...(map.get(entry.class_id) ?? []), entry]);
    });
    return map;
  }, [dateText, scheduleEntries]);

  const todayWeeklyByClass = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    scheduleEntries.forEach((entry) => {
      if (entry.schedule_type !== 'weekly' || entry.day_of_week !== day) return;
      map.set(entry.class_id, [...(map.get(entry.class_id) ?? []), entry]);
    });
    return map;
  }, [day, scheduleEntries]);

  const todaySchedule = useMemo(() => {
    const rows: Array<ScheduleEntry & { usesOverride: boolean }> = [];
    classes.forEach((courseClass) => {
      const overrides = todayOverridesByClass.get(courseClass.id);
      const entries = overrides?.length ? overrides : todayWeeklyByClass.get(courseClass.id);
      entries?.forEach((entry) => rows.push({ ...entry, usesOverride: Boolean(overrides?.length) }));
    });
    return sortByTime(rows);
  }, [classes, todayOverridesByClass, todayWeeklyByClass]);

  const scheduleCounts = useMemo(() => {
    const counts: Record<string, { weekly: number; today: number; total: number; next?: ScheduleEntry; hasTodayOverride: boolean }> = {};
    scheduleEntries.forEach((entry) => {
      if (!counts[entry.class_id]) {
        counts[entry.class_id] = { weekly: 0, today: 0, total: 0, hasTodayOverride: false };
      }

      counts[entry.class_id].total += 1;
      if (entry.schedule_type === 'weekly') counts[entry.class_id].weekly += 1;
      if (entry.schedule_type === 'one_time' && entry.schedule_date === dateText) counts[entry.class_id].hasTodayOverride = true;
      if (
        (entry.schedule_type === 'weekly' && entry.day_of_week === day)
        || (entry.schedule_type === 'one_time' && entry.schedule_date === dateText)
      ) {
        counts[entry.class_id].today += 1;
      }

      if (!counts[entry.class_id].next || entry.start_time < counts[entry.class_id].next!.start_time) {
        counts[entry.class_id].next = entry;
      }
    });
    return counts;
  }, [dateText, day, scheduleEntries]);

  const visibleClasses = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return classes;

    return classes.filter((courseClass) =>
      `${courseClass.name ?? ''} ${courseClass.batches?.name ?? ''} ${courseClass.batches?.code ?? ''} ${courseNamesForClass(courseClass)} ${teacherNamesForClass(courseClass)}`
        .toLowerCase()
        .includes(search),
    );
  }, [classes, courseNamesForClass, query, teacherNamesForClass]);

  const teacherOptions = useMemo(
    () => teachers
      .map((teacher) => ({ id: teacher.id, name: teacher.name?.trim() || 'Unnamed Teacher' }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [teachers],
  );

  const selectedTeacherClasses = useMemo(
    () => classes.filter((courseClass) => teacherIdsForClass(courseClass).includes(selectedTeacherId)),
    [classes, selectedTeacherId],
  );

  const openSelectedSchedule = () => {
    const targetClassId = scheduleTarget === 'class' ? selectedClassId : selectedTeacherClassId;
    if (!targetClassId) return;

    navigate(`/schedule/classes/${targetClassId}`);
  };

  const renderScheduleLine = (entry: ScheduleEntry & { usesOverride?: boolean }) => {
    const courseClass = classMap.get(entry.class_id);
    if (!courseClass) return null;

    return (
      <button
        key={`${entry.class_id}-${entry.id}`}
        type="button"
        onClick={() => navigate(`/schedule/classes/${entry.class_id}`)}
        className="w-full text-left rounded-sm border border-[#e2e8f0] bg-white hover:border-[#6a5182] hover:shadow-sm transition-all p-4 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[14px] font-extrabold text-[#4b3f68]">{courseClass.name || 'Class'}</p>
            <p className="text-[12.5px] text-[#64748b] mt-1">{courseClass.batches?.name || 'Batch'} | {courseNamesForClass(courseClass)}</p>
          </div>
          <span className={`rounded-sm px-2.5 py-1 text-[11px] font-bold ${entry.usesOverride ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#f3eff7] text-[#6a5182]'}`}>
            {entry.usesOverride ? 'Edited Today' : 'Weekly'}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12.5px] font-medium text-[#475569]">
          <span>{trimTime(entry.start_time)} - {trimTime(entry.end_time)}</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#94a3b8]" /> {entry.room || courseClass.room || 'Room not set'}</span>
          <span className="flex items-center gap-1.5"><Users size={14} className="text-[#94a3b8]" /> {teacherNamesForClass(courseClass)}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Schedule</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Create weekly schedules for batch-created classes and edit today without changing the weekly timetable.</p>
        </div>
        <div className="rounded-sm border border-[#e2e8f0] bg-white px-4 py-3">
          <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Today</p>
          <p className="text-[14px] font-extrabold text-[#4b3f68] mt-0.5">{day} | {new Date(`${dateText}T00:00:00`).toLocaleDateString()}</p>
        </div>
      </div>

      <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
          <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Create / Manage Schedule</h2>
          <p className="text-[12.5px] text-[#64748b] mt-1">Open a batch class, then create its weekly schedule or edit only today.</p>
        </div>

        <div className="p-5 grid grid-cols-1 xl:grid-cols-[260px_1fr_auto] gap-4 items-end">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setScheduleTarget('class')} className={`rounded-sm border px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer ${scheduleTarget === 'class' ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]' : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'}`}>
              Class
            </button>
            <button type="button" onClick={() => setScheduleTarget('teacher')} className={`rounded-sm border px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer ${scheduleTarget === 'teacher' ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]' : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'}`}>
              Teacher
            </button>
          </div>

          {scheduleTarget === 'class' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Select Batch Class</label>
              <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]">
                <option value="">Choose a class</option>
                {classes.map((courseClass) => (
                  <option key={courseClass.id} value={courseClass.id}>
                    {courseClass.name || 'Class'} | {courseClass.batches?.name || 'Batch'} | {courseNamesForClass(courseClass)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Select Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(event) => {
                    setSelectedTeacherId(event.target.value);
                    setSelectedTeacherClassId('');
                  }}
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                >
                  <option value="">Choose a teacher</option>
                  {teacherOptions.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assigned Batch Class</label>
                <select value={selectedTeacherClassId} onChange={(event) => setSelectedTeacherClassId(event.target.value)} disabled={!selectedTeacherId} className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b] disabled:opacity-60">
                  <option value="">{selectedTeacherId ? 'Choose assigned class' : 'Select teacher first'}</option>
                  {selectedTeacherClasses.map((courseClass) => (
                    <option key={courseClass.id} value={courseClass.id}>{courseClass.name || 'Class'} | {courseClass.batches?.name || 'Batch'}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button type="button" onClick={openSelectedSchedule} disabled={scheduleTarget === 'class' ? !selectedClassId : !selectedTeacherClassId} className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            Open Schedule
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          {error}
        </div>
      )}

      <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
          <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Today&apos;s Schedule</h2>
          <p className="text-[12.5px] text-[#64748b] mt-1">Uses today&apos;s edit when present; otherwise it inherits the weekly {day} schedule.</p>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="h-[220px] animate-pulse bg-[#f8fafc] border border-[#e2e8f0] rounded-sm" />
          ) : todaySchedule.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todaySchedule.map(renderScheduleLine)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 px-4 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-sm text-center">
              <Calendar size={42} className="text-[#cbd5e1] mb-4" />
              <h3 className="text-[17px] font-bold text-[#4b3f68] mb-1">No Classes Today</h3>
              <p className="text-[13px] text-[#64748b] max-w-md">Open a class schedule to add a weekly {day} row or a temporary today-only row.</p>
            </div>
          )}
        </div>
      </section>

      <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Batch Classes</h2>
            <p className="text-[12.5px] text-[#64748b] mt-1">{visibleClasses.length} classes shown</p>
          </div>
          <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search class, batch, course, teacher" className="bg-white border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full md:w-[340px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-[210px] animate-pulse bg-[#f8fafc] border border-[#e2e8f0] rounded-sm" />)}
          </div>
        ) : visibleClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
            {visibleClasses.map((courseClass) => {
              const counts = scheduleCounts[courseClass.id] ?? { weekly: 0, today: 0, total: 0, hasTodayOverride: false };
              const next = counts.next;

              return (
                <button key={courseClass.id} onClick={() => navigate(`/schedule/classes/${courseClass.id}`)} className="text-left bg-white rounded-sm border border-[#e2e8f0] p-5 hover:border-[#6a5182] hover:shadow-md transition-all cursor-pointer">
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <span className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold px-2.5 py-1 rounded-sm">
                      {courseClass.batches?.code || 'Batch'}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-sm ${counts.hasTodayOverride ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#f3eff7] text-[#6a5182]'}`}>
                      {counts.today} Today
                    </span>
                  </div>
                  <h3 className="text-[17px] font-extrabold text-[#4b3f68] leading-tight">{courseClass.name || 'Class'}</h3>
                  <p className="text-[13px] text-[#64748b] font-semibold mt-1">{courseClass.batches?.name || 'Batch not set'}</p>
                  <div className="mt-4 flex flex-col gap-2 text-[12.5px] text-[#475569] font-medium">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-[#94a3b8]" /> {courseNamesForClass(courseClass)}</span>
                    <span className="flex items-center gap-2"><Users size={14} className="text-[#94a3b8]" /> {teacherNamesForClass(courseClass)}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-[#94a3b8]" /> {next?.room || courseClass.room || 'Room not set'}</span>
                  </div>
                  {next && (
                    <p className="mt-4 rounded-sm bg-[#f8fafc] px-3 py-2 text-[12px] font-bold text-[#64748b]">
                      Next listed: {next.day_of_week || next.schedule_date} | {trimTime(next.start_time)} - {trimTime(next.end_time)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Calendar size={44} className="text-[#cbd5e1] mb-4" />
            <h2 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Batch Classes Found</h2>
            <p className="text-[14px] text-[#64748b] max-w-md">Create classes from batches first, then schedule those classes here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
