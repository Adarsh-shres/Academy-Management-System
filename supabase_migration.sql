-- ================================================================
-- FULL NOTIFICATIONS TABLE SETUP
-- Copy and paste this ENTIRE script into:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================


-- ── STEP 1: Drop old table if it exists (clean slate) ────────────
DROP TABLE IF EXISTS notifications CASCADE;


-- ── STEP 2: Create the notifications table ───────────────────────
CREATE TABLE notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who receives this notification (standard path)
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Legacy / teacher-specific path (kept for backwards compatibility)
  teacher_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content
  title       TEXT        NOT NULL DEFAULT 'Notification',
  message     TEXT        NOT NULL,

  -- Notification type: 'announcement' | 'content' | 'update'
  type        TEXT        NOT NULL DEFAULT 'announcement',

  -- Who was this targeted at: 'general' | 'student' | 'teacher' | 'class' | 'personal'
  target_type TEXT        NOT NULL DEFAULT 'general',

  -- Optional class reference (for class-specific notifications)
  class_id    UUID,

  -- Read state
  is_read     BOOLEAN     NOT NULL DEFAULT false,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── STEP 3: Indexes ───────────────────────────────────────────────
CREATE INDEX notifications_user_id_idx    ON notifications(user_id);
CREATE INDEX notifications_teacher_id_idx ON notifications(teacher_id);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX notifications_is_read_idx    ON notifications(is_read) WHERE is_read = false;


-- ── STEP 4: Enable Row Level Security ────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- ── STEP 5: RLS Policies ─────────────────────────────────────────

-- Users can SELECT their own notifications
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = teacher_id
  );

-- Users can UPDATE (mark as read) their own notifications
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() = teacher_id
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = teacher_id
  );

-- Backend service role can INSERT notifications for any user.
-- The service role bypasses RLS automatically, so no INSERT policy is needed.
-- However, if you are using the anon key on the backend, uncomment below:
-- CREATE POLICY "Allow inserts via anon"
--   ON notifications FOR INSERT
--   WITH CHECK (true);


-- ── STEP 6: Enable Realtime ───────────────────────────────────────
-- This pushes live INSERT/UPDATE/DELETE events to connected clients.
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- ── STEP 7: Verification ─────────────────────────────────────────
-- Run this after the script to confirm the schema looks correct.
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'notifications'
ORDER BY ordinal_position;
