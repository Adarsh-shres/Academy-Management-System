-- Run this in Supabase SQL Editor after deploying the app change.
-- Student course placement now belongs to batches/courses, not student_profiles.

alter table public.student_profiles
  drop column if exists course;
