-- SQL Script to initialize required tables for the Student Portal

-- 1. Enrollments Table
-- Maps students (users table) to specific courses
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Enable RLS for enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = student_id);

-- 2. Attendance Table
-- Tracks per-class attendance records for students
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id, date)
);

-- Enable RLS for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own attendance" ON public.attendance
    FOR SELECT USING (auth.uid() = student_id);

-- 3. Assignment Submissions Table
-- Connects the assignments table with the student's personal submission data
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded')),
    grade VARCHAR(20),
    marks_awarded INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- Enable RLS for submissions
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own submissions" ON public.assignment_submissions
    FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert/update their submissions" ON public.assignment_submissions
    FOR ALL USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Create a helper function / trigger definition to automatically populate new submissions when an assignment is created (optional, but good for UX)
-- This creates pending submissions for all users enrolled in the course.
CREATE OR REPLACE FUNCTION auto_create_pending_submissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.assignment_submissions (assignment_id, student_id, status)
  SELECT NEW.id, e.student_id, 'pending'
  FROM public.enrollments e
  WHERE e.course_id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Not all systems track assignments via linked course_id in the assignments table, but assuming they do:
-- If your assignments table has a course_id relation, execute this trigger. If it only has `course` string, we'll map manually from the frontend.

-- Note to User: Please review and execute this inside your Supabase project's SQL Editor.
