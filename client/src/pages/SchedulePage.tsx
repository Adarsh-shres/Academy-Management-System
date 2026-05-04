import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users } from '../components/shared/icons';
import { supabase } from '../lib/supabase';

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

export default function SchedulePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<CourseClass[]>([]);
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

    const { data: classRows, error: classError } = await supabase
      .from('classes')
      .select('id, name, teacher_id, room, student_ids, courses(name, course_code)')
      .order('name', { ascending: true });

    if (classError) {
      setError(classError.message);
      setIsLoading(false);
      return;
    }

    const nextClasses = (classRows as CourseClass[] | null) ?? [];
    setClasses(nextClasses);

    const classIds = nextClasses.map((courseClass) => courseClass.id);
    if (classIds.length > 0) {
      const { data: scheduleRows } = await supabase
        .from('class_schedules')
        .select('*')
        .in('class_id', classIds)
        .order('start_time', { ascending: true });

      setScheduleEntries((scheduleRows as ScheduleEntry[] | null) ?? []);
    } else {
      setScheduleEntries([]);
    }

    const teacherIds = Array.from(new Set(nextClasses.map((courseClass) => courseClass.teacher_id).filter(Boolean))) as string[];
    if (teacherIds.length > 0) {
      const { data: teacherRows } = await supabase
        .from('users')
        .select('id, name')
        .in('id', teacherIds);

      const names: Record<string, string> = {};
      ((teacherRows as TeacherProfile[] | null) ?? []).forEach((teacher) => {
        names[teacher.id] = teacher.name?.trim() || 'Unnamed Teacher';
      });
      setTeacherNames(names);
    } else {
      setTeacherNames({});
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadScheduleOverview();
  }, [loadScheduleOverview]);

  const { dateText, day } = getToday();

  const scheduleCounts = useMemo(() => {
    const counts: Record<string, { weekly: number; today: number; total: number; next?: ScheduleEntry }> = {};
    scheduleEntries.forEach((entry) => {
      if (!counts[entry.class_id]) {
        counts[entry.class_id] = { weekly: 0, today: 0, total: 0 };
      }

      counts[entry.class_id].total += 1;
      if (entry.schedule_type === 'weekly') counts[entry.class_id].weekly += 1;
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
      `${courseClass.name ?? ''} ${courseClass.courses?.name ?? ''} ${courseClass.courses?.course_code ?? ''} ${courseClass.teacher_id ? teacherNames[courseClass.teacher_id] : ''}`
        .toLowerCase()
        .includes(search),
    );
  }, [classes, query, scheduleCounts, teacherNames]);

  const teacherOptions = useMemo(
    () => Object.entries(teacherNames).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    [teacherNames],
  );

  const selectedTeacherClasses = useMemo(
    () => classes.filter((courseClass) => courseClass.teacher_id === selectedTeacherId),
    [classes, selectedTeacherId],
  );

  const openSelectedSchedule = () => {
    const targetClassId = scheduleTarget === 'class' ? selectedClassId : selectedTeacherClassId;
    if (!targetClassId) return;

    navigate(`/schedule/classes/${targetClassId}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Schedule</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Create or manage schedules by class or by teacher assignment.</p>
        </div>
        <div className="rounded-sm border border-[#e2e8f0] bg-white px-4 py-3">
          <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Today</p>
          <p className="text-[14px] font-extrabold text-[#4b3f68] mt-0.5">{day}</p>
        </div>
      </div>

      <section className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe]">
          <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">Create / Manage Schedule</h2>
          <p className="text-[12.5px] text-[#64748b] mt-1">Choose a class directly, or choose a teacher and then one of their assigned classes.</p>
        </div>

        <div className="p-5 grid grid-cols-1 xl:grid-cols-[260px_1fr_auto] gap-4 items-end">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScheduleTarget('class')}
              className={`rounded-sm border px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer ${
                scheduleTarget === 'class'
                  ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]'
                  : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'
              }`}
            >
              Class
            </button>
            <button
              type="button"
              onClick={() => setScheduleTarget('teacher')}
              className={`rounded-sm border px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer ${
                scheduleTarget === 'teacher'
                  ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]'
                  : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'
              }`}
            >
              Teacher
            </button>
          </div>

          {scheduleTarget === 'class' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Select Class</label>
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
              >
                <option value="">Choose a class</option>
                {classes.map((courseClass) => (
                  <option key={courseClass.id} value={courseClass.id}>
                    {courseClass.name || 'Class'} | {courseClass.courses?.name || 'Course'} | {courseClass.courses?.course_code || 'CRS'}
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
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Assigned Class</label>
                <select
                  value={selectedTeacherClassId}
                  onChange={(event) => setSelectedTeacherClassId(event.target.value)}
                  disabled={!selectedTeacherId}
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b] disabled:opacity-60"
                >
                  <option value="">{selectedTeacherId ? 'Choose assigned class' : 'Select teacher first'}</option>
                  {selectedTeacherClasses.map((courseClass) => (
                    <option key={courseClass.id} value={courseClass.id}>
                      {courseClass.name || 'Class'} | {courseClass.courses?.name || 'Course'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={openSelectedSchedule}
            disabled={scheduleTarget === 'class' ? !selectedClassId : !selectedTeacherClassId}
            className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Open Schedule
          </button>
        </div>
      </section>

      <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fbf8fe] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-[#4b3f68] font-bold text-[13px] uppercase tracking-wide">All Classes</h2>
            <p className="text-[12.5px] text-[#64748b] mt-1">{visibleClasses.length} classes shown</p>
          </div>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search class, course, teacher"
            className="bg-white border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full md:w-[320px] outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
          />
        </div>

        {error && (
          <div className="m-5 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-[190px] animate-pulse bg-[#f8fafc] border border-[#e2e8f0] rounded-sm" />)}
          </div>
        ) : visibleClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
            {visibleClasses.map((courseClass) => {
              const counts = scheduleCounts[courseClass.id] ?? { weekly: 0, today: 0, total: 0 };
              const teacherName = courseClass.teacher_id ? teacherNames[courseClass.teacher_id] : '';
              const next = counts.next;

              return (
                <button
                  key={courseClass.id}
                  onClick={() => navigate(`/schedule/classes/${courseClass.id}`)}
                  className="text-left bg-white rounded-sm border border-[#e2e8f0] p-5 hover:border-[#6a5182] hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <span className="bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] text-[11px] font-bold px-2.5 py-1 rounded-sm">
                      {courseClass.courses?.course_code || 'CRS'}
                    </span>
                    <span className="bg-[#f3eff7] text-[#6a5182] text-[11px] font-bold px-2.5 py-1 rounded-sm">
                      {counts.today} Today
                    </span>
                  </div>
                  <h3 className="text-[17px] font-extrabold text-[#4b3f68] leading-tight">{courseClass.name || 'Class'}</h3>
                  <p className="text-[13px] text-[#64748b] font-semibold mt-1">{courseClass.courses?.name || 'Course not set'}</p>
                  <div className="mt-4 flex flex-col gap-2 text-[12.5px] text-[#475569] font-medium">
                    <span className="flex items-center gap-2"><Users size={14} className="text-[#94a3b8]" /> {teacherName || 'No teacher assigned'}</span>
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-[#94a3b8]" /> {next?.room || courseClass.room || 'Room not set'}</span>
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-[#94a3b8]" /> {counts.weekly} weekly entries</span>
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
            <h2 className="text-[18px] font-bold text-[#4b3f68] mb-1">No Classes Found</h2>
            <p className="text-[14px] text-[#64748b] max-w-md">Create classes from Courses first, then manage their schedules here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
