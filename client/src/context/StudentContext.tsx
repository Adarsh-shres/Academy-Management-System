import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentFormData, StudentRecord } from '../types/student';
import {
  buildStudentFullName,
  buildStudentProfileUpsert,
  mapStudentRecord,
  type StudentProfileRow,
  type SupabaseStudentUserRow,
} from '../lib/studentProfiles';

interface StudentContextValue {
  students: StudentRecord[];
  getStudentById: (id: string) => StudentRecord | undefined;
  addStudent: (data: StudentFormData) => StudentRecord;
  updateStudent: (id: string, data: Partial<StudentRecord>) => Promise<void>;
  deleteStudent: (id: string) => void;
  toggleStudentStatus: (id: string) => void;
  refreshStudents: () => Promise<void>;
}

const StudentContext = createContext<StudentContextValue | null>(null);

const FALLBACK_STUDENTS: StudentRecord[] = [
  {
    id: 'stu-001',
    firstName: 'Arjun',
    lastName: 'Sharma',
    fatherName: 'Ramesh Sharma',
    dateOfBirth: '2004-05-12',
    mobileNo: '9800000001',
    email: 'arjun.sharma@university.edu',
    password: '',
    gender: 'Male',
    department: 'CSE',
    course: 'Collaborative Development',
    city: 'Kathmandu',
    address: 'Kathmandu',
    isActive: true,
    dateEnrolled: '2026-01-15',
  },
  {
    id: 'stu-002',
    firstName: 'Maya',
    lastName: 'Thapa',
    fatherName: 'Bikash Thapa',
    dateOfBirth: '2003-09-24',
    mobileNo: '9800000002',
    email: 'maya.thapa@university.edu',
    password: '',
    gender: 'Female',
    department: 'IT',
    course: 'Fullstack Development',
    city: 'Pokhara',
    address: 'Pokhara',
    isActive: true,
    dateEnrolled: '2026-01-16',
  },
  {
    id: 'stu-003',
    firstName: 'Nabin',
    lastName: 'Karki',
    fatherName: 'Hari Karki',
    dateOfBirth: '2004-02-08',
    mobileNo: '9800000003',
    email: 'nabin.karki@university.edu',
    password: '',
    gender: 'Male',
    department: 'CSE',
    course: 'Algorithms and Complexity',
    city: 'Lalitpur',
    address: 'Lalitpur',
    isActive: false,
    dateEnrolled: '2026-01-17',
  },
];

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<StudentRecord[]>([]);

  const refreshStudents = useCallback(async () => {
    try {
      // Call the backend — service role key bypasses RLS for student_profiles
      const res = await fetch('http://localhost:5000/students');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[StudentContext] Backend error:', err);
        setStudents(FALLBACK_STUDENTS);
        return;
      }

      const joined: { user: SupabaseStudentUserRow; profile: StudentProfileRow | null }[] =
        await res.json();

      if (joined.length === 0) {
        setStudents(FALLBACK_STUDENTS);
        return;
      }

      const profileMap = new Map<string, StudentProfileRow>(
        joined
          .filter((item) => item.profile !== null)
          .map((item) => [item.user.id, item.profile as StudentProfileRow]),
      );

      const mapped = joined
        .map((item) => mapStudentRecord(item.user, profileMap.get(item.user.id)))
        .filter((student): student is StudentRecord => Boolean(student));

      setStudents(mapped.length > 0 ? mapped : FALLBACK_STUDENTS);
    } catch (err) {
      console.error('[StudentContext] Network error fetching students:', err);
      setStudents(FALLBACK_STUDENTS);
    }
  }, []);

  useEffect(() => {
    void refreshStudents();
  }, [refreshStudents]);

  const getStudentById = useCallback(
    (id: string) => students.find((student) => student.id === id),
    [students],
  );

  const addStudent = useCallback((data: StudentFormData): StudentRecord => {
    const newStudent: StudentRecord = {
      ...data,
      id: crypto.randomUUID(),
      isActive: true,
      dateEnrolled: new Date().toISOString().split('T')[0],
    };
    setStudents((prev) => [newStudent, ...prev]);
    return newStudent;
  }, []);

  const updateStudent = useCallback(
    async (id: string, data: Partial<StudentRecord>) => {
      const currentStudent = students.find((student) => student.id === id);

      if (!currentStudent) {
        return;
      }

      const nextStudent: StudentRecord = {
        ...currentStudent,
        ...data,
        id,
        email: currentStudent.email,
      };

      // Update display name in users table (anon key is fine — users can update their own)
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: buildStudentFullName(nextStudent),
        })
        .eq('id', id);

      if (userError) {
        throw new Error(userError.message);
      }

      // Upsert profile via backend — service role key bypasses RLS
      const profileRes = await fetch(`http://localhost:5000/students/${id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildStudentProfileUpsert(nextStudent)),
      });

      if (!profileRes.ok) {
        const errBody = await profileRes.json().catch(() => ({}));
        throw new Error(errBody.error ?? 'Failed to update student profile');
      }

      setStudents((prev) => prev.map((student) => (student.id === id ? nextStudent : student)));
    },
    [students],
  );

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
  }, []);

  const toggleStudentStatus = useCallback((id: string) => {
    setStudents((prev) =>
      prev.map((student) => (student.id === id ? { ...student, isActive: !student.isActive } : student)),
    );
  }, []);

  return (
    <StudentContext.Provider
      value={{ students, getStudentById, addStudent, updateStudent, deleteStudent, toggleStudentStatus, refreshStudents }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudents must be used within <StudentProvider>');
  return ctx;
}
