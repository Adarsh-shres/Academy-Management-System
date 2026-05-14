alter table public.course_content enable row level security;

drop policy if exists "Students can read course content for their classes" on public.course_content;
create policy "Students can read course content for their classes"
on public.course_content
for select
to authenticated
using (
  exists (
    select 1
    from public.classes c
    where c.id = course_content.class_id
      and (
        coalesce(c.student_ids::uuid[], '{}'::uuid[]) @> array[auth.uid()]
        or exists (
          select 1
          from public.batches b
          where b.id = c.batch_id
            and coalesce(b.student_ids::uuid[], '{}'::uuid[]) @> array[auth.uid()]
        )
      )
  )
);
