-- Run this in Supabase SQL Editor to align the database with the new workflow:
-- Courses are standalone records, batches own student rosters, and classes are created from batches.

-- 1. Remove course-level scheduling. Scheduling belongs to classes/class_schedules.
alter table public.courses
  drop column if exists schedule_days,
  drop column if exists schedule_time;

-- 2. Keep the existing course_code column for compatibility, but convert values to simple serials.
-- This avoids the old level-based codes such as 4-CS-01 or 5cs01.
update public.courses
set course_code = 'TMP-' || id::text;

with ordered_courses as (
  select
    id,
    'CRS-' || lpad(row_number() over (order by created_at, name, id)::text, 3, '0') as next_code
  from public.courses
)
update public.courses c
set course_code = ordered_courses.next_code
from ordered_courses
where c.id = ordered_courses.id;

-- 3. Link classes to batches while keeping course_id for existing teacher/assignment features.
alter table public.classes
  add column if not exists batch_id uuid references public.batches(id) on delete set null,
  add column if not exists teacher_ids uuid[] not null default '{}';

create index if not exists idx_classes_batch_id on public.classes(batch_id);
create index if not exists idx_classes_course_id on public.classes(course_id);
create index if not exists idx_classes_teacher_ids on public.classes using gin(teacher_ids);

-- 4. Optional: if you want a completely clean start for old course-created classes,
-- uncomment the line below. Leave it commented if you need existing teacher/assignment data.
-- delete from public.classes where batch_id is null;
