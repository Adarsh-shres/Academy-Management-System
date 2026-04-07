import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { StudentRecord, StudentFormData } from '../types/student';
import { MOCK_STUDENTS } from '../data/mockStudents';

/* ─── Context shape ─────────────────────────────────────────── */

interface StudentContextValue {
  students: StudentRecord[];
  getStudentById: (id: string) => StudentRecord | undefined;
  addStudent: (data: StudentFormData) => StudentRecord;
  updateStudent: (id: string, data: Partial<StudentRecord>) => void;
  deleteStudent: (id: string) => void;
  toggleStudentStatus: (id: string) => void;
}

const StudentContext = createContext<StudentContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */

let nextId = MOCK_STUDENTS.length + 1;

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<StudentRecord[]>(MOCK_STUDENTS);

  const getStudentById = useCallback(
    (id: string) => students.find(s => s.id === id),
    [students],
  );

  const addStudent = useCallback((data: StudentFormData): StudentRecord => {
    const newStudent: StudentRecord = {
      ...data,
      id: String(nextId++),
      isActive: true,
      dateEnrolled: new Date().toISOString().split('T')[0],
    };
    setStudents(prev => [...prev, newStudent]);
    return newStudent;
  }, []);

  const updateStudent = useCallback((id: string, data: Partial<StudentRecord>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...data } : s)),
    );
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleStudentStatus = useCallback((id: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  }, []);

  return (
    <StudentContext.Provider
      value={{ students, getStudentById, addStudent, updateStudent, deleteStudent, toggleStudentStatus }}
    >
      {children}
    </StudentContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────── */

export function useStudents() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudents must be used within <StudentProvider>');
  return ctx;
}
