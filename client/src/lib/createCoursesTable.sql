-- Run this SQL in Supabase Dashboard → SQL Editor
-- Creates the courses table for the Academy Management System

CREATE TABLE IF NOT EXISTS courses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code    TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  department     TEXT NOT NULL DEFAULT 'CSE',
  faculty_lead   TEXT NOT NULL DEFAULT 'Unassigned',
  description    TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) — allow all for now (anon key)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policy: allow public read/write for the anon role (Super Admin uses anon key)
CREATE POLICY "Allow full access for anon" ON courses
  FOR ALL
  USING (true)
  WITH CHECK (true);

