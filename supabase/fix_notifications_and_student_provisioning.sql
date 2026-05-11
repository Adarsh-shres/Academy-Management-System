-- Run this in the Supabase SQL editor.
-- It aligns the live notifications table with the frontend notification system
-- and tightens access to recipient-owned notification rows.

create extension if not exists pgcrypto;

alter table if exists public.assignments
  add column if not exists deadline_notified_at timestamptz;

alter table if exists public.quizzes
  add column if not exists deadline_notified_at timestamptz;

alter table public.notifications
  add column if not exists user_id uuid references public.users(id) on delete cascade,
  add column if not exists title text,
  add column if not exists is_read boolean not null default false,
  add column if not exists assignment_id uuid;

alter table public.notifications
  alter column class_id drop not null,
  alter column teacher_id drop not null,
  alter column created_at type timestamptz using created_at::timestamptz,
  alter column created_at set default now();

update public.notifications
set title = 'Notification'
where title is null or btrim(title) = '';

alter table public.notifications
  alter column title set default 'Notification',
  alter column title set not null;

alter table public.notifications
  drop constraint if exists notifications_type_check;

update public.notifications
set type = 'announcement'
where type is null
  or type not in ('announcement', 'content', 'update', 'assignment_open', 'manual', 'deadline', 'schedule');

alter table public.notifications
  alter column type set default 'announcement',
  alter column type set not null,
  add constraint notifications_type_check
    check (type in ('announcement', 'content', 'update', 'assignment_open', 'manual', 'deadline', 'schedule'));

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_class_id_idx on public.notifications(class_id);
create index if not exists notifications_teacher_id_idx on public.notifications(teacher_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

create or replace function public.current_app_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_app_role() in ('admin', 'super_admin'), false)
$$;

create or replace function public.is_teacher_for_class(target_class_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = target_class_id
      and (
        c.teacher_id = auth.uid()
        or coalesce(c.teacher_ids, '{}'::uuid[]) @> array[auth.uid()]
      )
  )
$$;

create or replace function public.is_student_in_class(target_class_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = target_class_id
      and coalesce(c.student_ids::text[], '{}'::text[]) @> array[target_user_id::text]
  )
$$;

create or replace function public.reset_assignment_deadline_notification()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.due_date is distinct from new.due_date
     or old.due_time is distinct from new.due_time then
    new.deadline_notified_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists reset_assignment_deadline_notification on public.assignments;
create trigger reset_assignment_deadline_notification
  before update of due_date, due_time on public.assignments
  for each row
  execute function public.reset_assignment_deadline_notification();

create or replace function public.reset_quiz_deadline_notification()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.due_date is distinct from new.due_date then
    new.deadline_notified_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists reset_quiz_deadline_notification on public.quizzes;
create trigger reset_quiz_deadline_notification
  before update of due_date on public.quizzes
  for each row
  execute function public.reset_quiz_deadline_notification();

create or replace function public.create_due_deadline_teacher_notifications()
returns table(assignments_notified integer, quizzes_notified integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_count integer := 0;
  quiz_count integer := 0;
begin
  with due_assignments as (
    select
      a.id,
      a.teacher_id,
      a.class_id,
      coalesce(nullif(a.title, ''), 'Assignment') as title
    from public.assignments a
    where a.teacher_id is not null
      and a.due_date is not null
      and a.deadline_notified_at is null
      and (
        case
          when nullif(a.due_time::text, '') is not null
            then (a.due_date::date + a.due_time::time)::timestamptz
          else a.due_date::timestamptz
        end
      ) <= now()
  ),
  inserted_assignment_notifications as (
    insert into public.notifications (
      user_id,
      teacher_id,
      class_id,
      assignment_id,
      title,
      message,
      type,
      is_read,
      created_at
    )
    select
      due_assignments.teacher_id,
      due_assignments.teacher_id,
      due_assignments.class_id,
      due_assignments.id,
      'Assignment Deadline Ended',
      'The assignment "' || due_assignments.title || '" has reached its deadline.',
      'deadline',
      false,
      now()
    from due_assignments
    returning assignment_id
  ),
  updated_assignments as (
    update public.assignments a
    set deadline_notified_at = now()
    where a.id in (select assignment_id from inserted_assignment_notifications)
    returning a.id
  )
  select count(*) into assignment_count from updated_assignments;

  with due_quizzes as (
    select
      q.id,
      q.teacher_id,
      q.class_id,
      coalesce(nullif(q.title, ''), 'Quiz') as title
    from public.quizzes q
    where q.teacher_id is not null
      and q.due_date is not null
      and q.deadline_notified_at is null
      and coalesce(q.is_published, false) = true
      and q.due_date::timestamptz <= now()
  ),
  inserted_quiz_notifications as (
    insert into public.notifications (
      user_id,
      teacher_id,
      class_id,
      title,
      message,
      type,
      is_read,
      created_at
    )
    select
      due_quizzes.teacher_id,
      due_quizzes.teacher_id,
      due_quizzes.class_id,
      'Quiz Deadline Ended',
      'The quiz "' || due_quizzes.title || '" has reached its deadline.',
      'deadline',
      false,
      now()
    from due_quizzes
    returning class_id
  ),
  updated_quizzes as (
    update public.quizzes q
    set deadline_notified_at = now()
    where q.id in (select id from due_quizzes)
    returning q.id
  )
  select count(*) into quiz_count from updated_quizzes;

  assignments_notified := assignment_count;
  quizzes_notified := quiz_count;
  return next;
end;
$$;

-- Run this once to test deadline notifications immediately:
-- select * from public.create_due_deadline_teacher_notifications();
--
-- To make this automatic in Supabase, schedule that select to run every few minutes
-- using the Dashboard scheduler/pg_cron if it is enabled for your project.

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;
drop policy if exists "Admins and teachers can create notifications" on public.notifications;
drop policy if exists "Admins can delete notifications" on public.notifications;
drop policy if exists "Allow authenticated read notifications" on public.notifications;
drop policy if exists "Allow authenticated update notifications" on public.notifications;
drop policy if exists "Allow authenticated insert notifications" on public.notifications;

create policy "Users can read own notifications"
  on public.notifications
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or teacher_id = auth.uid()
    or public.is_admin()
  );

create policy "Users can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    user_id = auth.uid()
    or public.is_admin()
  );

create policy "Admins and teachers can create notifications"
  on public.notifications
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.current_app_role() = 'teacher'
      and teacher_id = auth.uid()
      and class_id is not null
      and public.is_teacher_for_class(class_id)
      and public.is_student_in_class(class_id, user_id)
    )
  );

create policy "Admins can delete notifications"
  on public.notifications
  for delete
  to authenticated
  using (public.is_admin());

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;
