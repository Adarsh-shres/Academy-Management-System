import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Course, CourseRow } from '../types/course';
import { rowToCourse, courseToRow } from '../types/course';
import { supabase } from '../lib/supabase';

/* ─── Context shape ─────────────────────────────────────────── */

interface CourseContextValue {
  courses: Course[];
  loading: boolean;
  error: string | null;
  getCourseById: (id: string) => Course | undefined;
  addCourse: (data: Omit<Course, 'id' | 'createdAt'>) => Promise<Course>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextValue | null>(null);

/* ─── Provider ──────────────────────────────────────────────── */

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Fetch all courses from Supabase ── */
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

  /* ── Load on mount ── */
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /* ── Get single course by ID ── */
  const getCourseById = useCallback(
    (id: string) => courses.find(c => c.id === id),
    [courses],
  );

  /* ── CREATE ── */
  const addCourse = useCallback(
    async (data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
      setError(null);

      const insertPayload = courseToRow(data as Partial<Course>);

      const { data: rows, error: insertError } = await supabase
        .from('courses')
        .insert([insertPayload])
        .select();

      if (insertError) {
        console.error('Error adding course:', insertError);
        setError(insertError.message);
        throw insertError;
      }

      const newCourse = rowToCourse((rows as CourseRow[])[0]);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    },
    [],
  );

  /* ── UPDATE ── */
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

      setCourses(prev =>
        prev.map(c => (c.id === id ? { ...c, ...data } : c)),
      );
    },
    [],
  );

  /* ── DELETE ── */
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

      setCourses(prev => prev.filter(c => c.id !== id));
    },
    [],
  );

  return (
    <CourseContext.Provider
      value={{
        courses,
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

/* ─── Hook ──────────────────────────────────────────────────── */

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within <CourseProvider>');
  return ctx;
}
