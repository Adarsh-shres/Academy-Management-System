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

-- Seed with initial courses so the page isn't empty
INSERT INTO courses (course_code, name, status, department, faculty_lead, description) VALUES
  ('CRS-001', 'Collaborative Development',      'Active',   'CSE', 'Prof. Linus Torvalds',  'Team-based software development practices including version control, code review, and agile methodologies.'),
  ('CRS-002', 'Fullstack Development',           'Active',   'CSE', 'Prof. Sunita Sharma',   'End-to-end web application development covering React, Node.js, databases, and deployment.'),
  ('CRS-003', 'Algorithms and Complexity',       'Inactive', 'CSE', 'Prof. Sunita Sharma',   'Advanced algorithmic techniques, complexity analysis, NP-completeness, and optimization.'),
  ('CRS-004', 'Beginner Python Course',          'Active',   'IT',  'Dr. Guido Rossum',      'Introduction to Python programming covering syntax, data structures, and basic scripting.'),
  ('CRS-005', 'Beginner Java Course',            'Active',   'CSE', 'Dr. Alan Turing',       'Fundamentals of Java programming, OOP principles, collections, and exception handling.'),
  ('CRS-006', 'Beginner React Course',           'Active',   'CSE', 'Prof. Linus Torvalds',  'Modern React development with hooks, context, routing, and component patterns.'),
  ('CRS-007', 'Game Development Fundamentals',   'Inactive', 'IT',  'Dr. John Doe',          'Introduction to game development concepts, 2D rendering, physics engines, and game loops.'),
  ('CRS-008', 'Beginner Javascript Course',      'Active',   'CSE', 'Prof. Linus Torvalds',  'Core JavaScript from variables and functions to async programming and DOM manipulation.'),
  ('CRS-009', 'Web Development Course',          'Active',   'IT',  'Dr. John Doe',          'HTML, CSS, JavaScript, and responsive design for building modern web interfaces.')
ON CONFLICT (course_code) DO NOTHING;
