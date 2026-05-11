-- Run this in the Supabase SQL editor.
-- It aligns the live notifications table with the frontend notification system
-- and tightens access to recipient-owned notification rows.

create extension if not exists pgcrypto;

alter table public.notifications
  add column if not exists user_id uuid references public.users(id) on delete cascade,
  add column if not exists title text,
  add column if not exists is_read boolean not null default false;

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
