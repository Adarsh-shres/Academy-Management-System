import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { StudentFormData, StudentRecord } from '../types/student';
import {
  buildStudentFullName,
  buildStudentProfileUpsert,
  mapStudentRecord,
  STUDENT_PROFILE_SELECT,
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
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'student')
      .order('name', { ascending: true });

    if (error) {
      console.error('[StudentContext] Failed to load students:', error.message);
      setStudents(FALLBACK_STUDENTS);
      return;
    }

    const studentRows = (data as SupabaseStudentUserRow[]) ?? [];
    let profileMap = new Map<string, StudentProfileRow>();

    if (studentRows.length > 0) {
      const { data: profileRows, error: profileError } = await supabase
        .from('student_profiles')
        .select(STUDENT_PROFILE_SELECT)
        .in(
          'student_id',
          studentRows.map((student) => student.id),
        );

      if (profileError) {
        if (profileError.code !== '42P01') {
          console.error('[StudentContext] Failed to load student profiles:', profileError.message);
        }
      } else {
        profileMap = new Map((profileRows as StudentProfileRow[]).map((profile) => [profile.student_id, profile]));
      }
    }

    const mapped = studentRows
      .map((row) => mapStudentRecord(row, profileMap.get(row.id)))
      .filter((student): student is StudentRecord => Boolean(student));

    setStudents(mapped.length > 0 ? mapped : FALLBACK_STUDENTS);
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

      const { error: userError } = await supabase
        .from('users')
        .update({
          name: buildStudentFullName(nextStudent),
        })
        .eq('id', id);

      if (userError) {
        throw new Error(userError.message);
      }

      const { error: profileError } = await supabase
        .from('student_profiles')
        .upsert(buildStudentProfileUpsert(nextStudent), { onConflict: 'student_id' });

      if (profileError) {
        throw new Error(profileError.message);
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
