-- Allow enrolled students to read teacher-uploaded course content.
-- Run this in the Supabase SQL Editor for the project.

alter table if exists public.course_content enable row level security;
alter table if exists public.classes enable row level security;
alter table if exists public.batches enable row level security;

grant select on public.course_content to authenticated;
grant select on public.classes to authenticated;
grant select on public.batches to authenticated;
grant insert, update, delete on public.course_content to authenticated;

update public.course_content cc
set course_id = c.course_id
from public.classes c
where cc.class_id = c.id
  and cc.course_id is null
  and c.course_id is not null;

drop policy if exists "Students can read their own batch rows" on public.batches;
create policy "Students can read their own batch rows"
on public.batches
for select
to authenticated
using (
  coalesce(student_ids, '{}'::text[]) @> array[auth.uid()::text]
  or exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role in ('super_admin', 'admin')
  )
);

drop policy if exists "Students can read their own classes" on public.classes;
create policy "Students can read their own classes"
on public.classes
for select
to authenticated
using (
  coalesce(student_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
  or teacher_id = auth.uid()
  or coalesce(teacher_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
  or exists (
    select 1
    from public.batches b
    where b.id = classes.batch_id
      and coalesce(b.student_ids, '{}'::text[]) @> array[auth.uid()::text]
  )
  or exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role in ('super_admin', 'admin')
  )
);

drop policy if exists "Students can view enrolled course content" on public.course_content;

create policy "Students can view enrolled course content"
on public.course_content
for select
to authenticated
using (
  exists (
    select 1
    from public.classes c
    where c.id = course_content.class_id
      and (
        coalesce(c.student_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
        or exists (
          select 1
          from public.batches b
          where b.id = c.batch_id
            and coalesce(b.student_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
        )
      )
  )
);

drop policy if exists "Teachers can manage own course content" on public.course_content;

create policy "Teachers can manage own course content"
on public.course_content
for all
to authenticated
using (
  teacher_id = auth.uid()
  or exists (
    select 1
    from public.classes c
    where c.id = course_content.class_id
      and (
        c.teacher_id = auth.uid()
        or coalesce(c.teacher_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
      )
  )
)
with check (
  teacher_id = auth.uid()
  or exists (
    select 1
    from public.classes c
    where c.id = course_content.class_id
      and (
        c.teacher_id = auth.uid()
        or coalesce(c.teacher_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
      )
  )
);
