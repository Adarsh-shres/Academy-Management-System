-- ====================================================================
-- SEED DATA FOR STUDENT PORTAL (FOR ALL STUDENTS)
-- ====================================================================
-- This updated version uses subqueries to automatically find the 
-- correct UUIDs based on the users' email addresses. 
-- You do NOT need to replace any placeholders manually!
-- Just run this directly in the Supabase SQL Editor.
-- ====================================================================

-- ====================================================================
-- STEP 1: STUDENT PROFILES
-- ====================================================================
INSERT INTO public.student_profiles
  (student_id, father_name, date_of_birth, mobile_no, gender, department, course, city, address)
VALUES
  ((SELECT id FROM public.users WHERE email = 'sanjay@school.edu' LIMIT 1), 'Bishnu Pun Magar',  '2003-06-10', '9841112233', 'Male',   'CSE', 'Fullstack Development',      'Kathmandu',  'Kalimati, Kathmandu'),
  ((SELECT id FROM public.users WHERE email = 'samir1@gmail.com' LIMIT 1), 'Rajesh Raj',        '2002-09-18', '9812345678', 'Male',   'CSE', 'Collaborative Development',  'Lalitpur',   'Pulchowk, Lalitpur'),
  ((SELECT id FROM public.users WHERE email = 'sanjay@gmail.com' LIMIT 1), 'Ramesh Thapa',      '2004-01-22', '9856781234', 'Male',   'IT',  'Beginner Python Course',     'Bhaktapur',  'Suryabinayak, Bhaktapur'),
  ((SELECT id FROM public.users WHERE email = 'ashman@gmail.com' LIMIT 1), 'Mr. Ketchum',       '2002-11-25', '9867654321', 'Male',   'IT',  'Web Development Course',     'Pokhara',    'Lakeside, Pokhara'),
  ((SELECT id FROM public.users WHERE email = 'student@school.edu' LIMIT 1), 'Hari Bahadur',      '2003-03-15', '9823456789', 'Male',   'CSE', 'Beginner Java Course',       'Chitwan',    'Bharatpur, Chitwan'),
  ((SELECT id FROM public.users WHERE email = 'test1@gmail.com' LIMIT 1), 'Suman Adhikari',    '2003-08-05', '9845671234', 'Female', 'CSE', 'Beginner React Course',      'Kathmandu',  'Thamel, Kathmandu')
ON CONFLICT (student_id) DO UPDATE SET
  father_name = EXCLUDED.father_name,
  mobile_no = EXCLUDED.mobile_no,
  city = EXCLUDED.city;

-- ====================================================================
-- STEP 2: ENROLLMENTS
-- ====================================================================
-- Enrolling students in their respective courses based on their profiles
INSERT INTO public.enrollments (student_id, course_id)
SELECT sp.student_id, c.id
FROM public.student_profiles sp
JOIN public.courses c ON c.name = sp.course
WHERE sp.student_id IS NOT NULL
ON CONFLICT (student_id, course_id) DO NOTHING;

-- ====================================================================
-- STEP 3: CLASSES (Assuming basic structure)
-- ====================================================================
-- If you don't have classes yet, we'll create a default one for each course
INSERT INTO public.classes (name, course_id)
SELECT 'Section A', id FROM public.courses
ON CONFLICT DO NOTHING;

-- ====================================================================
-- STEP 4: ASSIGNMENTS
-- ====================================================================
INSERT INTO public.assignments
  (teacher_id, course_id, class_id, title, description, due_date, due_time, attachment_url, portal_open)
SELECT
  (SELECT id FROM public.users WHERE email = 'ram4@gmail.com' LIMIT 1),
  c.id,
  (SELECT id FROM public.classes cl WHERE cl.course_id = c.id LIMIT 1),
  'Mid-term Project: ' || c.name,
  'Please submit your final project report and code repository link for ' || c.name || '.',
  CURRENT_DATE + INTERVAL '7 days',
  '23:59:00',
  'https://example.com/templates/project_template.pdf',
  true
FROM public.courses c
WHERE c.status = 'Active'
ON CONFLICT DO NOTHING;

-- ====================================================================
-- STEP 5: ATTENDANCE
-- ====================================================================
-- Generate 10 days of attendance for each enrollment
INSERT INTO public.attendance (student_id, course_id, date, status)
SELECT
  e.student_id,
  e.course_id,
  d::date,
  CASE WHEN random() < 0.1 THEN 'Absent' WHEN random() < 0.2 THEN 'Late' ELSE 'Present' END
FROM public.enrollments e
CROSS JOIN generate_series(CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, INTERVAL '1 day') AS d
ON CONFLICT (student_id, course_id, date) DO NOTHING;

-- ====================================================================
-- STEP 6: ASSIGNMENT SUBMISSIONS
-- ====================================================================
-- Create submissions for all students for their respective course assignments
INSERT INTO public.assignment_submissions (assignment_id, student_id, status, submitted_at, file_url)
SELECT
  a.id,
  e.student_id,
  CASE WHEN random() < 0.3 THEN 'pending' ELSE 'submitted' END as status,
  CASE WHEN random() < 0.3 THEN NULL ELSE (CURRENT_TIMESTAMP - INTERVAL '1 day') END as submitted_at,
  CASE WHEN random() < 0.3 THEN NULL ELSE 'https://example.com/submissions/assignment_' || a.id || '_student_' || e.student_id || '.pdf' END as file_url
FROM public.assignments a
JOIN public.enrollments e ON e.course_id = a.course_id
ON CONFLICT (assignment_id, student_id) DO NOTHING;

