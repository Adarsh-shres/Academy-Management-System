import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ScheduleEntry } from '../types/schedule';
import { MOCK_SCHEDULE } from '../data/mockSchedule';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { isMissingTeacherSchedulesTable } from '../lib/supabaseErrors';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function trimTime(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 5);
}

function normalizeDay(value: string) {
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return '';

  return DAY_NAMES.find((day) => day.toLowerCase() === cleaned)
    ?? DAY_NAMES.find((day) => day.toLowerCase().startsWith(cleaned.slice(0, 3)))
    ?? '';
}

type TeacherScheduleRow = {
  id: string;
  teacher_id: string;
  class_id?: string | null;
  title: string;
  schedule_type: 'weekly' | 'one_time';
  day_of_week?: string | null;
  schedule_date?: string | null;
  start_time: string;
  end_time: string;
  room?: string | null;
  notes?: string | null;
  is_cancelled?: boolean | null;
};

type TeacherClassRow = {
  id: string;
  name?: string | null;
  room?: string | null;
  teacher_id?: string | null;
  teacher_ids?: string[] | null;
  batches?: {
    name?: string | null;
    code?: string | null;
  } | null;
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

interface ScheduleContextValue {
  schedule: ScheduleEntry[];
  mySchedule: ScheduleEntry[];
  getEntryById: (id: number) => ScheduleEntry | undefined;
  addEntry: (data: Omit<ScheduleEntry, 'id'>) => ScheduleEntry;
  updateEntry: (id: number, data: Partial<ScheduleEntry>) => void;
  deleteEntry: (id: number) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

let nextId = MOCK_SCHEDULE.length + 1;

function teacherIdsForClass(classRow: TeacherClassRow) {
  return Array.from(new Set([...(classRow.teacher_ids ?? []), ...(classRow.teacher_id ? [classRow.teacher_id] : [])]));
}

function entryIdForRow(row: TeacherScheduleRow, index: number) {
  const parsed = Number.parseInt(row.id.replaceAll('-', '').slice(0, 8), 16);
  return Number.isFinite(parsed) ? parsed : index + 1000;
}

function sortTeacherEntries(entries: ScheduleEntry[]) {
  return [...entries].sort((a, b) => a.time.localeCompare(b.time));
}

/** Stores schedule data and exposes local schedule mutations. */
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(MOCK_SCHEDULE);
  const [teacherSchedule, setTeacherSchedule] = useState<ScheduleEntry[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      setTeacherSchedule([]);
      return;
    }

    async function fetchTeacherSchedule() {
      if (!user) return;

      const today = DAY_NAMES[new Date().getDay()];
      const todayDate = getLocalDateString();

      const [classResult, scheduleResult] = await Promise.all([
        supabase
          .from('classes')
          .select('id, name, room, teacher_id, teacher_ids, batches(name, code)')
          .order('name', { ascending: true }),
        supabase
          .from('teacher_schedules')
          .select('id, teacher_id, class_id, title, schedule_type, day_of_week, schedule_date, start_time, end_time, room, notes, is_cancelled')
          .eq('teacher_id', user.id)
          .order('start_time', { ascending: true }),
      ]);

      if (scheduleResult.error) {
        if (isMissingTeacherSchedulesTable(scheduleResult.error) && !classResult.error) {
          const classRows = ((classResult.data as TeacherClassRow[] | null) ?? [])
            .filter((classRow) => teacherIdsForClass(classRow).includes(user.id));
          const classIds = classRows.map((classRow) => classRow.id);
          const classMap = new Map(classRows.map((classRow) => [classRow.id, classRow]));

          if (classIds.length === 0) {
            setTeacherSchedule([]);
            return;
          }

          const { data: classScheduleData, error: classScheduleError } = await supabase
            .from('class_schedules')
            .select('id, class_id, schedule_type, day_of_week, schedule_date, start_time, end_time, room, notes')
            .in('class_id', classIds)
            .order('start_time', { ascending: true });

          if (classScheduleError) {
            console.error('Error fetching fallback teacher class schedule:', classScheduleError.message);
            setTeacherSchedule([]);
            return;
          }

          const entries = ((classScheduleData as ClassScheduleRow[] | null) ?? [])
            .filter((entry) => (
              (entry.schedule_type === 'weekly' && normalizeDay(entry.day_of_week ?? '') === today)
              || (entry.schedule_type === 'one_time' && entry.schedule_date === todayDate)
            ))
            .map((entry, index) => {
              const classRow = classMap.get(entry.class_id);
              const start = trimTime(entry.start_time);
              const end = trimTime(entry.end_time);

              return {
                id: index + 1000,
                time: end ? `${start} - ${end}` : start,
                course: classRow?.name?.trim() || 'Class schedule',
                level: classRow?.batches?.name?.trim() || classRow?.batches?.code?.trim() || 'Teacher schedule',
                instructor: user.name || 'Teacher',
                room: entry.room?.trim() || classRow?.room?.trim() || 'Room not set',
              };
            });

          setTeacherSchedule(sortTeacherEntries(entries));
          return;
        }

        console.error('Error fetching teacher schedule entries:', scheduleResult.error.message);
        setTeacherSchedule([]);
        return;
      }

      if (classResult.error) {
        console.error('Error fetching teacher schedule classes:', classResult.error.message);
      }

      const classRows = ((classResult.data as TeacherClassRow[] | null) ?? [])
        .filter((classRow) => teacherIdsForClass(classRow).includes(user.id));
      const classMap = new Map(classRows.map((classRow) => [classRow.id, classRow]));

      const entries = ((scheduleResult.data as TeacherScheduleRow[] | null) ?? [])
        .filter((entry) => (
          !entry.is_cancelled
          && (
            (entry.schedule_type === 'weekly' && normalizeDay(entry.day_of_week ?? '') === today)
            || (entry.schedule_type === 'one_time' && entry.schedule_date === todayDate)
          )
        ))
        .map((entry, index) => {
          const classRow = entry.class_id ? classMap.get(entry.class_id) : undefined;
          const start = trimTime(entry.start_time);
          const end = trimTime(entry.end_time);

          return {
            id: entryIdForRow(entry, index),
            time: end ? `${start} - ${end}` : start,
            course: entry.title.trim() || classRow?.name?.trim() || 'Teacher session',
            level: classRow?.batches?.name?.trim() || classRow?.batches?.code?.trim() || classRow?.name?.trim() || 'Teacher schedule',
            instructor: user.name || 'Teacher',
            room: entry.room?.trim() || classRow?.room?.trim() || 'Room not set',
          };
        });

      setTeacherSchedule(sortTeacherEntries(entries));
    }

    void fetchTeacherSchedule();
  }, [user]);

  const mySchedule = useMemo(() => {
    if (!user) return [];

    if (user.role === 'teacher') {
      return teacherSchedule;
    }

    // Students still use the mock schedule for now.
    return schedule.slice(-4);
  }, [schedule, teacherSchedule, user]);

  const getEntryById = useCallback(
    (id: number) => schedule.find((entry) => entry.id === id),
    [schedule],
  );

  const addEntry = useCallback((data: Omit<ScheduleEntry, 'id'>): ScheduleEntry => {
    const newEntry: ScheduleEntry = { ...data, id: nextId++ };
    setSchedule((prev) => [...prev, newEntry]);
    return newEntry;
  }, []);

  const updateEntry = useCallback((id: number, data: Partial<ScheduleEntry>) => {
    setSchedule((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...data } : entry)),
    );
  }, []);

  const deleteEntry = useCallback((id: number) => {
    setSchedule((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return (
    <ScheduleContext.Provider value={{ schedule, mySchedule, getEntryById, addEntry, updateEntry, deleteEntry }}>
      {children}
    </ScheduleContext.Provider>
  );
}

/** Returns the active schedule context. */
export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within <ScheduleProvider>');
  return ctx;
}
