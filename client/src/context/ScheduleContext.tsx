import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ScheduleEntry } from '../types/schedule';
import { MOCK_SCHEDULE } from '../data/mockSchedule';
import { useAuth } from './AuthContext';

/* ─── Context shape ─────────────────────────────────────────── */

interface ScheduleContextValue {
  schedule: ScheduleEntry[];
  mySchedule: ScheduleEntry[];
  getEntryById: (id: number) => ScheduleEntry | undefined;
  addEntry: (data: Omit<ScheduleEntry, 'id'>) => ScheduleEntry;
  updateEntry: (id: number, data: Partial<ScheduleEntry>) => void;
  deleteEntry: (id: number) => void;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */

let nextId = MOCK_SCHEDULE.length + 1;

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(MOCK_SCHEDULE);

  const mySchedule = useMemo(() => {
    if (!user) return [];
    if (user.role === 'teacher') {
      // Mock teacher's schedule: First 4 items in the schedule
      return schedule.slice(0, 4);
    } else {
      // Mock student's schedule: Last 4 items in the schedule
      return schedule.slice(-4);
    }
  }, [schedule, user]);

  const getEntryById = useCallback(
    (id: number) => schedule.find(e => e.id === id),
    [schedule],
  );

  const addEntry = useCallback((data: Omit<ScheduleEntry, 'id'>): ScheduleEntry => {
    const newEntry: ScheduleEntry = { ...data, id: nextId++ };
    setSchedule(prev => [...prev, newEntry]);
    return newEntry;
  }, []);

  const updateEntry = useCallback((id: number, data: Partial<ScheduleEntry>) => {
    setSchedule(prev =>
      prev.map(e => (e.id === id ? { ...e, ...data } : e)),
    );
  }, []);

  const deleteEntry = useCallback((id: number) => {
    setSchedule(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <ScheduleContext.Provider value={{ schedule, mySchedule, getEntryById, addEntry, updateEntry, deleteEntry }}>
      {children}
    </ScheduleContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────── */

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within <ScheduleProvider>');
  return ctx;
}
