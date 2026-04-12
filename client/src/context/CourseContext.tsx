import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Course, CourseRow } from '../types/course';
import { courseToRow, rowToCourse } from '../types/course';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CourseContextValue {
  courses: Course[];
  myCourses: Course[];
  loading: boolean;
  error: string | null;
  getCourseById: (id: string) => Course | undefined;
  addCourse: (data: Omit<Course, 'id' | 'createdAt'>) => Promise<Course>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching courses:', fetchError);
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setCourses((data as CourseRow[]).map(rowToCourse));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const myCourses = useMemo(() => {
    if (!user) return [];

    const activeCourses = courses.filter((course) => course.status === 'Active');

    if (user.role === 'teacher') {
      const assignedCourses = activeCourses.filter((course) => course.facultyLead === user.name);
      return assignedCourses.length > 0 ? assignedCourses : activeCourses.slice(0, 3);
    }

    if (user.role === 'student') {
      // Keep the student dashboard populated until enrollments are modeled.
      return activeCourses.slice(0, 4);
    }

    return activeCourses;
  }, [courses, user]);

  const getCourseById = useCallback(
    (id: string) => courses.find((course) => course.id === id),
    [courses],
  );

  const addCourse = useCallback(
    async (data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
      setError(null);

      const insertPayload = courseToRow(data);
      const { data: row, error: insertError } = await supabase
        .from('courses')
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) {
        console.error('Error adding course:', insertError);
        setError(insertError.message);
        throw insertError;
      }

      const newCourse = rowToCourse(row as CourseRow);
      setCourses((prev) => [...prev, newCourse]);
      return newCourse;
    },
    [],
  );

  const updateCourse = useCallback(
    async (id: string, data: Partial<Course>) => {
      setError(null);

      const updatePayload = courseToRow(data);
      const { error: updateError } = await supabase
        .from('courses')
        .update(updatePayload)
        .eq('id', id);

      if (updateError) {
        console.error('Error updating course:', updateError);
        setError(updateError.message);
        throw updateError;
      }

      setCourses((prev) =>
        prev.map((course) => (course.id === id ? { ...course, ...data } : course)),
      );
    },
    [],
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      setError(null);

      const { error: deleteError } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting course:', deleteError);
        setError(deleteError.message);
        throw deleteError;
      }

      setCourses((prev) => prev.filter((course) => course.id !== id));
    },
    [],
  );

  return (
    <CourseContext.Provider
      value={{
        courses,
        myCourses,
        loading,
        error,
        getCourseById,
        addCourse,
        updateCourse,
        deleteCourse,
        refreshCourses: fetchCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within <CourseProvider>');
  return ctx;
}
