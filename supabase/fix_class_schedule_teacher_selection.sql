-- Adds explicit teacher selection to class schedules.
-- Run after fix_class_schedule_course_selection.sql.

alter table public.class_schedules
  add column if not exists teacher_id uuid;

alter table public.class_schedules
  drop constraint if exists class_schedules_teacher_id_fkey;

alter table public.class_schedules
  add constraint class_schedules_teacher_id_fkey
  foreign key (teacher_id)
  references public.users(id)
  on delete set null;

create index if not exists class_schedules_teacher_id_idx
  on public.class_schedules(teacher_id);

-- Backfill existing schedule rows from the class primary teacher.
update public.class_schedules cs
set teacher_id = c.teacher_id
from public.classes c
where cs.class_id = c.id
  and cs.teacher_id is null
  and c.teacher_id is not null;

-- If the class uses teacher_ids but no primary teacher, use the first teacher.
update public.class_schedules cs
set teacher_id = c.teacher_ids[1]
from public.classes c
where cs.class_id = c.id
  and cs.teacher_id is null
  and c.teacher_ids is not null
  and array_length(c.teacher_ids, 1) > 0;
