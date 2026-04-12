import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ScheduleEntry } from '../types/schedule';
import { MOCK_SCHEDULE } from '../data/mockSchedule';
import { useAuth } from './AuthContext';

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

  const mySchedule = useMemo(() => {
    if (!user) return [];

    // Mock views split the seeded schedule by role until assignments are wired.
    if (user.role === 'teacher') {
      return schedule.slice(0, 4);
    }

    return schedule.slice(-4);
  }, [schedule, user]);

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
