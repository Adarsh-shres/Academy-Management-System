import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Course } from '../types/course';
import { MOCK_COURSES } from '../data/mockCourses';

/* ─── Context shape ─────────────────────────────────────────── */

interface CourseContextValue {
  courses: Course[];
  getCourseById: (id: string) => Course | undefined;
  addCourse: (data: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
}

const CourseContext = createContext<CourseContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */

let nextNum = MOCK_COURSES.length + 1;
const generateCourseId = () => {
  const id = `5cs${String(nextNum++).padStart(2, '0')}`;
  return id;
};

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);

  const getCourseById = useCallback(
    (id: string) => courses.find(c => c.id === id),
    [courses],
  );

  const addCourse = useCallback((data: Omit<Course, 'id'>): Course => {
    const newCourse: Course = { ...data, id: generateCourseId() };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, []);

  const updateCourse = useCallback((id: string, data: Partial<Course>) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, ...data } : c)),
    );
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <CourseContext.Provider value={{ courses, getCourseById, addCourse, updateCourse, deleteCourse }}>
      {children}
    </CourseContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────── */

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within <CourseProvider>');
  return ctx;
}
