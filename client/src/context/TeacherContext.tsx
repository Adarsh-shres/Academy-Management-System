import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Teacher } from '../types/teacher';
import {
  buildTeacherProfileUpsert,
  normalizeTeacherStatus,
  TEACHER_PROFILE_SELECT,
  type TeacherProfileRow,
} from '../lib/teacherProfiles';

interface TeacherContextValue {
  teachers: Teacher[];
  getTeacherById: (id: string) => Teacher | undefined;
  addTeacher: (data: Omit<Teacher, 'id'>) => Teacher;
  updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>;
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

function mapTeacher(row: SupabaseUserRow, profile?: TeacherProfileRow | null): Teacher | null {
  if (row.role !== 'teacher') {
    return null;
  }

  const name = row.name?.trim() || 'Unnamed Teacher';

  return {
    id: row.id,
    name,
    initials: getInitials(name),
    subject: profile?.subject?.trim() || 'Not assigned yet',
    department: profile?.department?.trim() || 'Not set',
    employeeId: `FAC-${row.id.slice(0, 6).toUpperCase()}`,
    status: normalizeTeacherStatus(profile?.status),
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
      setTeachers([]);
      return;
    }

    const teacherRows = (data as SupabaseUserRow[]) ?? [];
    let profileMap = new Map<string, TeacherProfileRow>();

    if (teacherRows.length > 0) {
      const { data: profileRows, error: profileError } = await supabase
        .from('teacher_profiles')
        .select(TEACHER_PROFILE_SELECT)
        .in(
          'teacher_id',
          teacherRows.map((t) => t.id),
        );

      if (profileError) {
        // Table may not exist yet — that's OK, we just use defaults
        if (profileError.code !== '42P01') {
          console.error('[TeacherContext] Failed to load teacher profiles:', profileError.message);
        }
      } else {
        profileMap = new Map((profileRows as TeacherProfileRow[]).map((p) => [p.teacher_id, p]));
      }
    }

    const mapped = teacherRows
      .map((row) => mapTeacher(row, profileMap.get(row.id)))
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

  const updateTeacher = useCallback(async (id: string, data: Partial<Teacher>) => {
    // Optimistically update local state first
    setTeachers((prev) => prev.map((teacher) => (teacher.id === id ? { ...teacher, ...data } : teacher)));

    // Persist name change to the users table
    if (data.name !== undefined) {
      const { error: userError } = await supabase
        .from('users')
        .update({ name: data.name })
        .eq('id', id);

      if (userError) {
        console.error('[TeacherContext] Failed to update user name:', userError.message);
      }
    }

    // Persist profile fields (subject, department, status) to teacher_profiles
    const currentTeacher = teachers.find((t) => t.id === id);
    const merged = { ...currentTeacher, ...data, id };

    const profilePayload = buildTeacherProfileUpsert({
      id,
      subject: merged.subject ?? 'Not assigned yet',
      department: merged.department ?? 'Not set',
      status: merged.status ?? 'Active',
    });

    const { error: profileError } = await supabase
      .from('teacher_profiles')
      .upsert(profilePayload, { onConflict: 'teacher_id' });

    if (profileError) {
      console.error('[TeacherContext] Failed to update teacher profile:', profileError.message);
    }
  }, [teachers]);

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
