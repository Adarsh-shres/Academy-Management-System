import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Teacher } from '../types/teacher';

interface TeacherContextValue {
  teachers: Teacher[];
  getTeacherById: (id: string) => Teacher | undefined;
  addTeacher: (data: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  refreshTeachers: () => Promise<void>;
}

interface SupabaseUserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
}

const TeacherContext = createContext<TeacherContextValue | null>(null);

const GRADIENTS = [
  'from-[#0ea5b0] to-[#006496]',
  'from-[#164e6a] to-[#0d3349]',
  'from-[#fbbf24] to-[#d97706]',
  'from-[#f87171] to-[#ef4444]',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function gradientForId(id: string) {
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return GRADIENTS[charCode % GRADIENTS.length];
}

function mapTeacher(row: SupabaseUserRow): Teacher | null {
  if (row.role !== 'teacher') {
    return null;
  }

  const name = row.name?.trim() || 'Unnamed Teacher';

  return {
    id: row.id,
    name,
    initials: getInitials(name),
    subject: 'Not assigned yet',
    department: 'Not set',
    employeeId: `FAC-${row.id.slice(0, 6).toUpperCase()}`,
    status: 'Active',
    avatarGradient: gradientForId(row.id),
    totalClasses: 0,
    totalStudents: 0,
    avgAttendance: 0,
    upcomingSessions: 0,
    schedule: [],
    activities: [],
  };
}

export function TeacherProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const refreshTeachers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'teacher')
      .order('name', { ascending: true });

    if (error) {
      console.error('[TeacherContext] Failed to load teachers:', error.message);
      return;
    }

    const mapped = (data as SupabaseUserRow[])
      .map(mapTeacher)
      .filter((teacher): teacher is Teacher => Boolean(teacher));

    setTeachers(mapped);
  }, []);

  useEffect(() => {
    refreshTeachers();
  }, [refreshTeachers]);

  const getTeacherById = useCallback(
    (id: string) => teachers.find((teacher) => teacher.id === id),
    [teachers],
  );

  const addTeacher = useCallback((data: Omit<Teacher, 'id'>): Teacher => {
    const newTeacher: Teacher = {
      ...data,
      id: crypto.randomUUID(),
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    return newTeacher;
  }, []);

  const updateTeacher = useCallback((id: string, data: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((teacher) => (teacher.id === id ? { ...teacher, ...data } : teacher)));
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
  }, []);

  return (
    <TeacherContext.Provider value={{ teachers, getTeacherById, addTeacher, updateTeacher, deleteTeacher, refreshTeachers }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeachers() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error('useTeachers must be used within <TeacherProvider>');
  return ctx;
}
