import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Course } from '../types/course';
import { MOCK_COURSES } from '../data/mockCourses';
import { useAuth } from './AuthContext';

interface CourseContextValue {
  courses: Course[];
  myCourses: Course[];
  getCourseById: (id: string) => Course | undefined;
  addCourse: (data: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
}

const CourseContext = createContext<CourseContextValue | null>(null);

let nextNum = MOCK_COURSES.length + 1;

/** Generates local course ids while the page still relies on mock state. */
function generateCourseId() {
  return `5cs${String(nextNum++).padStart(2, '0')}`;
}

/** Stores course data and exposes local course mutations. */
export function CourseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);

  const myCourses = useMemo(() => {
    if (!user) return [];

    // Mock views split the seeded courses by role until enrollments are wired.
    if (user.role === 'teacher') {
      return courses.slice(0, 3);
    }

    return courses.slice(3, 7);
  }, [courses, user]);

  const getCourseById = useCallback(
    (id: string) => courses.find((course) => course.id === id),
    [courses],
  );

  const addCourse = useCallback((data: Omit<Course, 'id'>): Course => {
    const newCourse: Course = { ...data, id: generateCourseId() };
    setCourses((prev) => [...prev, newCourse]);
    return newCourse;
  }, []);

  const updateCourse = useCallback((id: string, data: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === id ? { ...course, ...data } : course)),
    );
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  }, []);

  return (
    <CourseContext.Provider value={{ courses, myCourses, getCourseById, addCourse, updateCourse, deleteCourse }}>
      {children}
    </CourseContext.Provider>
  );
}

/** Returns the active course context. */
export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within <CourseProvider>');
  return ctx;
}
