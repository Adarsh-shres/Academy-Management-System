-- ============================================================
-- Attendance Table for Teacher Attendance Management
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  time TEXT,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, student_id, date)
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can insert attendance
CREATE POLICY "Teachers can insert attendance"
  ON attendance FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

-- Policy: Teachers can update attendance
CREATE POLICY "Teachers can update attendance"
  ON attendance FOR UPDATE
  USING (teacher_id = auth.uid());

-- Policy: Teachers can view attendance for their classes
CREATE POLICY "Teachers can view attendance"
  ON attendance FOR SELECT
  USING (teacher_id = auth.uid());

-- Policy: Students can view their own attendance
CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  USING (student_id = auth.uid());
