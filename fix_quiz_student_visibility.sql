-- Allow students to see published quizzes for classes they belong to.
-- Run this in the Supabase SQL editor if student quiz pages show empty lists
-- while teachers can see published quizzes.

alter table if exists public.quizzes enable row level security;
alter table if exists public.quiz_questions enable row level security;
alter table if exists public.quiz_submissions enable row level security;
alter table if exists public.classes enable row level security;
alter table if exists public.batches enable row level security;

grant select on public.quizzes to authenticated;
grant select on public.quiz_questions to authenticated;
grant select, insert on public.quiz_submissions to authenticated;
grant select on public.classes to authenticated;
grant select on public.batches to authenticated;

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
    or coalesce(teacher_ids, '{}'::uuid[]) @> array[auth.uid()]
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

drop policy if exists "Admins can manage classes" on public.classes;
create policy "Admins can manage classes"
  on public.classes
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role in ('super_admin', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role in ('super_admin', 'admin')
    )
  );

drop policy if exists "Students can read published quizzes for their classes" on public.quizzes;
create policy "Students can read published quizzes for their classes"
  on public.quizzes
  for select
  to authenticated
  using (
    coalesce(is_published, false) = true
    and exists (
      select 1
      from public.classes c
      where c.id = quizzes.class_id
        and (
          coalesce(c.student_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
          or exists (
            select 1
            from public.batches b
            where b.id = c.batch_id
              and coalesce(b.student_ids, '{}'::text[]) @> array[auth.uid()::text]
          )
        )
    )
  );

drop policy if exists "Students can read questions for visible published quizzes" on public.quiz_questions;
create policy "Students can read questions for visible published quizzes"
  on public.quiz_questions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.quizzes q
      join public.classes c on c.id = q.class_id
      where q.id = quiz_questions.quiz_id
        and coalesce(q.is_published, false) = true
        and (
          coalesce(c.student_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
          or exists (
            select 1
            from public.batches b
            where b.id = c.batch_id
              and coalesce(b.student_ids, '{}'::text[]) @> array[auth.uid()::text]
          )
        )
    )
  );

drop policy if exists "Students can read own quiz submissions" on public.quiz_submissions;
create policy "Students can read own quiz submissions"
  on public.quiz_submissions
  for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students can insert own quiz submissions" on public.quiz_submissions;
create policy "Students can insert own quiz submissions"
  on public.quiz_submissions
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.quizzes q
      join public.classes c on c.id = q.class_id
      where q.id = quiz_submissions.quiz_id
        and coalesce(q.is_published, false) = true
        and (
          coalesce(c.student_ids::text[], '{}'::text[]) @> array[auth.uid()::text]
          or exists (
            select 1
            from public.batches b
            where b.id = c.batch_id
              and coalesce(b.student_ids, '{}'::text[]) @> array[auth.uid()::text]
          )
        )
    )
  );
