-- 1. Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('content', 'update', 'announcement')),
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Note: In order for Supabase Realtime to stream changes for this table,
-- you must manually enable Realtime for the 'notifications' table in your Supabase Dashboard:
-- Database -> Replication -> Source -> toggle 'notifications'.
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 2. Trigger Function: Generate notification when NEW content is inserted
CREATE OR REPLACE FUNCTION trigger_new_course_content_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_record RECORD;
BEGIN
  -- We assume 'course_content' has a 'course_id', and there is an 'enrollments' or similar table linking users to courses.
  -- Replace 'enrollments' with your actual table linking students to courses if it's named differently.
  
  -- Create a notification for every user enrolled in the course where the content was added
  FOR student_record IN 
    SELECT student_id FROM enrollments WHERE course_id = NEW.course_id 
  LOOP
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      student_record.student_id,
      'New Course Material Added',
      'New material "' || NEW.title || '" has been added to your course.',
      'content'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach the INSERT trigger to course_content
DROP TRIGGER IF EXISTS on_course_content_insert ON course_content;
CREATE TRIGGER on_course_content_insert
  AFTER INSERT ON course_content
  FOR EACH ROW
  EXECUTE FUNCTION trigger_new_course_content_notification();

-- 4. Trigger Function: Generate notification when content is UPDATED
CREATE OR REPLACE FUNCTION trigger_update_course_content_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_record RECORD;
BEGIN
  -- Only trigger if the title or actual content changed, not just read counts or minor fields
  IF OLD.title IS DISTINCT FROM NEW.title OR OLD.content IS DISTINCT FROM NEW.content THEN
    FOR student_record IN 
      SELECT student_id FROM enrollments WHERE course_id = NEW.course_id 
    LOOP
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (
        student_record.student_id,
        'Course Material Updated',
        'The material "' || NEW.title || '" has been updated.',
        'update'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach the UPDATE trigger to course_content
DROP TRIGGER IF EXISTS on_course_content_update ON course_content;
CREATE TRIGGER on_course_content_update
  AFTER UPDATE ON course_content
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_course_content_notification();
