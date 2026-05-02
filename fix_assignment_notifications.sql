-- 1. Create the function to handle assignment notifications
CREATE OR REPLACE FUNCTION trigger_new_assignment_notification()
RETURNS TRIGGER AS $$
DECLARE
  student_record RECORD;
BEGIN
  -- Create a notification for every student enrolled in the course
  FOR student_record IN 
    SELECT student_id FROM enrollments WHERE course_id = NEW.course_id 
  LOOP
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      student_record.student_id,
      'New Assignment Posted',
      'A new assignment "' || NEW.title || '" has been added for your course.',
      'update' -- using 'update' or 'content' to match existing types
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the trigger to the assignments table
DROP TRIGGER IF EXISTS on_assignment_insert ON assignments;
CREATE TRIGGER on_assignment_insert
  AFTER INSERT ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_new_assignment_notification();
