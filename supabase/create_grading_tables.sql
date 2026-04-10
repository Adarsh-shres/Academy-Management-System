-- Create Assignment Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    class_id TEXT, -- Or UUID depending on your classes table
    file_url TEXT,
    status TEXT DEFAULT 'submitted', -- 'submitted', 'graded'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Submissions
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert submissions" ON public.assignment_submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view submissions" ON public.assignment_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow teachers to update submissions" ON public.assignment_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create Assignment Grades Table
CREATE TABLE IF NOT EXISTS public.assignment_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    grade NUMERIC CHECK (grade >= 0 AND grade <= 100),
    feedback TEXT,
    graded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Grades
ALTER TABLE public.assignment_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert grades" ON public.assignment_grades
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view grades" ON public.assignment_grades
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow teachers to update grades" ON public.assignment_grades
    FOR UPDATE USING (auth.role() = 'authenticated');
