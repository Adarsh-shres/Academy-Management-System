import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Teacher } from '../types/teacher';
import { MOCK_TEACHERS } from '../data/mockTeachers';

/* ─── Context shape ─────────────────────────────────────────── */

interface TeacherContextValue {
  teachers: Teacher[];
  getTeacherById: (id: string) => Teacher | undefined;
  addTeacher: (data: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
}

const TeacherContext = createContext<TeacherContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */

let nextId = MOCK_TEACHERS.length + 1;

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);

  const getTeacherById = useCallback(
    (id: string) => teachers.find(t => t.id === id),
    [teachers],
  );

  const addTeacher = useCallback((data: Omit<Teacher, 'id'>): Teacher => {
    const newTeacher: Teacher = { ...data, id: String(nextId++) };
    setTeachers(prev => [...prev, newTeacher]);
    return newTeacher;
  }, []);

  const updateTeacher = useCallback((id: string, data: Partial<Teacher>) => {
    setTeachers(prev =>
      prev.map(t => (t.id === id ? { ...t, ...data } : t)),
    );
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <TeacherContext.Provider value={{ teachers, getTeacherById, addTeacher, updateTeacher, deleteTeacher }}>
      {children}
    </TeacherContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────── */

export function useTeachers() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error('useTeachers must be used within <TeacherProvider>');
  return ctx;
}
