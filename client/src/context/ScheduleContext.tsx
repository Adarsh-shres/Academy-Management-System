import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ScheduleEntry } from '../types/schedule';
import { MOCK_SCHEDULE } from '../data/mockSchedule';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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

/** Stores schedule data and exposes local schedule mutations. */
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(MOCK_SCHEDULE);
  const [teacherSchedule, setTeacherSchedule] = useState<ScheduleEntry[]>([]);

  // Fetch real schedule from Supabase for teachers
  useEffect(() => {
    if (!user || user.role !== 'teacher') return;

    async function fetchTeacherSchedule() {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = dayNames[new Date().getDay()];

      const { data, error } = await supabase
        .from('classes')
        .select('id, name, room, schedule_days, schedule_time, courses(name)')
        .eq('teacher_id', user!.id);

      if (error) {
        console.error('Error fetching teacher schedule:', error.message);
        setTeacherSchedule([]);
        return;
      }

      // Filter classes that are scheduled for today
      const todayClasses = (data || []).filter((cls: any) => {
        if (!cls.schedule_days) return false;
        // schedule_days may be an array or comma-separated string
        const days = Array.isArray(cls.schedule_days)
          ? cls.schedule_days
          : String(cls.schedule_days).split(',').map((d: string) => d.trim());
        return days.some((d: string) => d.toLowerCase() === today.toLowerCase());
      });

      const entries: ScheduleEntry[] = todayClasses.map((cls: any, idx: number) => ({
        id: idx + 1000,
        time: cls.schedule_time || '—',
        course: cls.courses?.name || cls.name || 'Unknown',
        level: cls.name || '—',
        instructor: user!.name,
        room: cls.room || '—',
      }));

      setTeacherSchedule(entries);
    }

    fetchTeacherSchedule();
  }, [user]);

  const mySchedule = useMemo(() => {
    if (!user) return [];

    if (user.role === 'teacher') {
      return teacherSchedule;
    }

    // Students still use the mock schedule for now
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
