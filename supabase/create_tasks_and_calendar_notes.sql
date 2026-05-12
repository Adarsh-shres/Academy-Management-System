-- =====================================================
-- Migration: Create tasks and calendar_notes tables
-- Required for Bug 1 (Tasks persistence) and Bug 3 (Calendar notes persistence)
-- =====================================================

-- ─── Tasks Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS Policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Calendar Notes Table ───────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  note TEXT DEFAULT '' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- RLS Policies for calendar_notes
ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar notes"
  ON public.calendar_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar notes"
  ON public.calendar_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar notes"
  ON public.calendar_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar notes"
  ON public.calendar_notes FOR DELETE
  USING (auth.uid() = user_id);
