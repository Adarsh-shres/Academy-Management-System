-- Adds explicit course selection to class schedules.
-- Run this in Supabase SQL editor before using the updated admin schedule UI.

alter table public.class_schedules
  add column if not exists course_id uuid;

alter table public.class_schedules
  drop constraint if exists class_schedules_course_id_fkey;

alter table public.class_schedules
  add constraint class_schedules_course_id_fkey
  foreign key (course_id)
  references public.courses(id)
  on delete set null;

create index if not exists class_schedules_course_id_idx
  on public.class_schedules(course_id);

-- Give existing classes a course when they were created before the UI exposed this choice.
update public.classes c
set course_id = nullif(b.course_ids[1], '')::uuid
from public.batches b
where c.batch_id = b.id
  and c.course_id is null
  and b.course_ids is not null
  and array_length(b.course_ids, 1) > 0
  and b.course_ids[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Backfill schedule rows from their parent class.
update public.class_schedules cs
set course_id = c.course_id
from public.classes c
where cs.class_id = c.id
  and cs.course_id is null
  and c.course_id is not null;
