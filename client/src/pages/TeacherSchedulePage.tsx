import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { isMissingTeacherSchedulesTable } from '../lib/supabaseErrors';
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
  schedule_type: 'weekly' | 'one_time';
  day_of_week?: string | null;
  schedule_date?: string | null;
  start_time: string;
  end_time: string;
  room?: string | null;
  notes?: string | null;
};

type TeacherScheduleEntry = TeacherScheduleRow & {
  className: string;
  classLabel: string;
  dateLabel: string;
};

type FormState = {
  scheduleType: 'weekly' | 'one_time';
  dayOfWeek: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  title: string;
  room: string;
  notes: string;
  classId: string;
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

function defaultFormState(todayDay: string, todayDate: string): FormState {
  return {
    scheduleType: 'weekly',
    dayOfWeek: todayDay,
    scheduleDate: todayDate,
    startTime: '',
    endTime: '',
    title: '',
    room: '',
    notes: '',
    classId: '',
  };
}

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TeacherScheduleEntry[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClassRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isTeacherScheduleUnavailable, setIsTeacherScheduleUnavailable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState('');
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = getLocalDateString();
  const [form, setForm] = useState<FormState>(defaultFormState(todayDay, todayDate));

  const loadSchedule = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');
    setIsTeacherScheduleUnavailable(false);

    const [classResult, scheduleResult] = await Promise.all([
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
    ]);

    if (classResult.error) {
      setError(classResult.error.message);
      setAssignedClasses([]);
      setEntries([]);
      setIsLoading(false);
      return;
    }

    const classes = (classResult.data as AssignedClassRow[] | null) ?? [];
    const classMap = new Map(classes.map((classRow) => [classRow.id, classRow]));

    if (scheduleResult.error && isMissingTeacherSchedulesTable(scheduleResult.error)) {
      const classIds = classes.map((classRow) => classRow.id);

      if (classIds.length === 0) {
        setAssignedClasses(classes);
        setEntries([]);
        setIsTeacherScheduleUnavailable(true);
        setIsLoading(false);
        return;
      }

      const { data: classScheduleRows, error: classScheduleError } = await supabase
        .from('class_schedules')
        .select('id, class_id, schedule_type, day_of_week, schedule_date, start_time, end_time, room, notes')
        .in('class_id', classIds)
        .order('schedule_type', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (classScheduleError) {
        setError(classScheduleError.message);
        setAssignedClasses(classes);
        setEntries([]);
        setIsTeacherScheduleUnavailable(true);
        setIsLoading(false);
        return;
      }

      setAssignedClasses(classes);
      setEntries(((classScheduleRows as ClassScheduleRow[] | null) ?? []).map((entry) => {
        const classRow = classMap.get(entry.class_id);

        return {
          id: `class-${entry.id}`,
          teacher_id: user.id,
          class_id: entry.class_id,
          schedule_type: entry.schedule_type,
          day_of_week: entry.day_of_week,
          schedule_date: entry.schedule_date,
          start_time: entry.start_time,
          end_time: entry.end_time,
          title: classRow?.name?.trim() || 'Class schedule',
          room: entry.room || classRow?.room || null,
          notes: entry.notes,
          is_cancelled: false,
          className: classLabelForRow(classRow),
          classLabel: classRow?.name?.trim() || 'Class',
          dateLabel: entry.schedule_type === 'weekly'
            ? (entry.day_of_week || 'Weekly')
            : formatDate(entry.schedule_date),
        };
      }));
      setIsTeacherScheduleUnavailable(true);
      setIsLoading(false);
      return;
    }

    if (scheduleResult.error) {
      setError(scheduleResult.error.message);
      setAssignedClasses(classes);
      setEntries([]);
      setIsLoading(false);
      return;
    }

    const rows = (scheduleResult.data as TeacherScheduleRow[] | null) ?? [];

    setAssignedClasses(classes);
    setEntries(rows
      .filter((entry) => !entry.is_cancelled)
      .map((entry) => ({
        ...entry,
        className: classLabelForRow(entry.class_id ? classMap.get(entry.class_id) : null),
        classLabel: entry.class_id ? (classMap.get(entry.class_id)?.name?.trim() || 'Class') : 'Independent teaching block',
        dateLabel: entry.schedule_type === 'weekly'
          ? (entry.day_of_week || 'Weekly')
          : formatDate(entry.schedule_date),
      })));

    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const resetForm = useCallback(() => {
    setForm(defaultFormState(todayDay, todayDate));
    setEditingId('');
    setFormError('');
  }, [todayDate, todayDay]);

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
    () => sortByTime(entries.filter((entry) => entry.schedule_type === 'one_time')),
    [entries],
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

  const openEditor = (entry?: TeacherScheduleEntry) => {
    if (!entry) {
      resetForm();
      return;
    }

    setEditingId(entry.id);
    setForm({
      scheduleType: entry.schedule_type,
      dayOfWeek: entry.day_of_week || todayDay,
      scheduleDate: entry.schedule_date || todayDate,
      startTime: trimTime(entry.start_time),
      endTime: trimTime(entry.end_time),
      title: entry.title,
      room: entry.room || '',
      notes: entry.notes || '',
      classId: entry.class_id || '',
    });
    setFormError('');
  };

  const updateForm = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEntry = async () => {
    if (!user?.id) return;

    if (isTeacherScheduleUnavailable) {
      setFormError('Teacher schedules table is missing. Run create_teacher_schedules_schema.sql before saving teacher blocks.');
      return;
    }

    if (!form.title.trim()) {
      setFormError('Add a title for the teacher schedule block.');
      return;
    }

    if (!form.startTime || !form.endTime || form.endTime <= form.startTime) {
      setFormError('Provide a valid start and end time.');
      return;
    }

    if (form.scheduleType === 'weekly' && !form.dayOfWeek) {
      setFormError('Choose a weekly day.');
      return;
    }

    if (form.scheduleType === 'one_time' && !form.scheduleDate) {
      setFormError('Choose a date for the one-time entry.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    const payload = {
      teacher_id: user.id,
      class_id: form.classId || null,
      schedule_type: form.scheduleType,
      day_of_week: form.scheduleType === 'weekly' ? form.dayOfWeek : null,
      schedule_date: form.scheduleType === 'one_time' ? form.scheduleDate : null,
      start_time: form.startTime,
      end_time: form.endTime,
      title: form.title.trim(),
      room: form.room.trim() || null,
      notes: form.notes.trim() || null,
      is_cancelled: false,
    };

    const result = editingId
      ? await supabase.from('teacher_schedules').update(payload).eq('id', editingId).eq('teacher_id', user.id)
      : await supabase.from('teacher_schedules').insert(payload);

    if (result.error) {
      setFormError(result.error.message);
      setIsSaving(false);
      return;
    }

    await loadSchedule();
    resetForm();
    setIsSaving(false);
  };

  const deleteEntry = async (entryId: string) => {
    if (!user?.id) return;
    if (isTeacherScheduleUnavailable) return;
    if (!window.confirm('Delete this teacher schedule entry?')) return;

    setIsSaving(true);
    const { error: deleteError } = await supabase
      .from('teacher_schedules')
      .delete()
      .eq('id', entryId)
      .eq('teacher_id', user.id);

    if (deleteError) {
      setFormError(deleteError.message);
      setIsSaving(false);
      return;
    }

    if (editingId === entryId) {
      resetForm();
    }

    await loadSchedule();
    setIsSaving(false);
  };

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
      {!isTeacherScheduleUnavailable && (
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => openEditor(entry)}
            className="text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteEntry(entry.id)}
            disabled={isSaving}
            className="text-[12px] font-bold text-[#dc2626] hover:text-[#991b1b] cursor-pointer disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">Teacher Schedule</h1>
          <p className="text-[#64748b] font-medium mt-1">Separate from class schedules. Use this for substitutions, rotations, and quick changes.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          Could not load schedule: {error}
        </div>
      )}

      {isTeacherScheduleUnavailable && (
        <div className="mb-6 rounded-sm border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[13px] font-semibold text-[#92400e]">
          Teacher schedule table is not installed yet. Showing linked class schedules in read-only mode.
        </div>
      )}

      {formError && (
        <div className="mb-6 rounded-sm border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
          {formError}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <div className="h-[520px] animate-pulse rounded-sm bg-white border border-[#e7dff0]" />
          <div className="h-[780px] animate-pulse rounded-sm bg-white border border-[#e7dff0]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
          <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden sticky top-4">
            <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarCheck2 size={18} className="text-[#6a5182]" />
                  <h2 className="text-[16px] font-extrabold text-[#4b3f68]">Quick Teacher Editor</h2>
                </div>
                <p className="text-[12.5px] text-[#64748b] font-medium mt-1">{editingId ? 'Editing an existing teacher block.' : 'Add a new teacher block.'}</p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-[12px] font-bold text-[#6a5182] hover:text-[#4b3f68] cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {(['weekly', 'one_time'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateForm('scheduleType', mode)}
                    className={`rounded-sm border px-3 py-2.5 text-[12px] font-bold transition-colors cursor-pointer ${form.scheduleType === mode ? 'border-[#6a5182] bg-[#f3eff7] text-[#6a5182]' : 'border-[#cbd5e1] bg-white text-[#64748b] hover:bg-[#f8fafc]'}`}
                  >
                    {mode === 'weekly' ? 'Weekly' : 'One Time'}
                  </button>
                ))}
              </div>

              {form.scheduleType === 'weekly' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Day of Week</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={(event) => updateForm('dayOfWeek', event.target.value)}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  >
                    {DAYS_OF_WEEK.map((day) => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Schedule Date</label>
                  <input
                    type="date"
                    value={form.scheduleDate}
                    onChange={(event) => updateForm('scheduleDate', event.target.value)}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Start</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) => updateForm('startTime', event.target.value)}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">End</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) => updateForm('endTime', event.target.value)}
                    className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  placeholder="Chemistry lecture, substitution, lab block"
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Linked Class</label>
                <select
                  value={form.classId}
                  onChange={(event) => updateForm('classId', event.target.value)}
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                >
                  <option value="">Independent block</option>
                  {assignedClasses.map((classRow) => (
                    <option key={classRow.id} value={classRow.id}>
                      {classLabelForRow(classRow)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Room</label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(event) => updateForm('room', event.target.value)}
                  placeholder="Room 205"
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm('notes', event.target.value)}
                  rows={3}
                  placeholder="Substitute teacher, split class, exam supervision"
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-2 focus:ring-[#6a5182]/10 transition-all text-[#1e293b] resize-none"
                />
              </div>

              <button
                type="button"
                onClick={saveEntry}
                disabled={isSaving || isTeacherScheduleUnavailable}
                className="px-6 py-2.5 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold rounded-sm transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update Teacher Block' : 'Save Teacher Block'}
              </button>
            </div>
          </section>

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
                    <p className="text-[12.5px] text-[#64748b] mt-1">Add a teacher schedule row for today or a recurring weekly block.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
              <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe]">
                <h2 className="text-[16px] font-extrabold text-[#4b3f68]">One-Time Schedule</h2>
                <p className="text-[12.5px] text-[#64748b] font-medium mt-1">{oneTimeEntries.length} date-specific blocks.</p>
              </div>
              <div className="p-5 flex flex-col gap-3">
                {oneTimeEntries.length > 0 ? (
                  oneTimeEntries.map((entry) => renderEntry(entry))
                ) : (
                  <p className="text-[13px] font-semibold text-[#64748b] rounded-sm border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center">
                    No one-time teacher blocks scheduled.
                  </p>
                )}
              </div>
            </section>

            <section className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] overflow-hidden">
              <div className="p-5 border-b border-[#e7dff0] bg-[#fbf8fe] flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-[16px] font-extrabold text-[#4b3f68]">Weekly Schedule</h2>
                  <p className="text-[12.5px] text-[#64748b] font-medium mt-1">Recurring teacher blocks from Sunday through Friday.</p>
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
        </div>
      )}
    </div>
  );
}
