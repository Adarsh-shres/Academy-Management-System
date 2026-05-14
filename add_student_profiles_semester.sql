ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS semester TEXT DEFAULT '';
