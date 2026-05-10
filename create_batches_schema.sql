-- Run this in Supabase SQL editor before using the persisted batch workflow.
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  status text not null default 'Active' check (status in ('Active', 'Archived')),
  course_ids text[] not null default '{}',
  student_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_batches_status on public.batches(status);
create index if not exists idx_batches_course_ids on public.batches using gin(course_ids);
create index if not exists idx_batches_student_ids on public.batches using gin(student_ids);

alter table public.batches enable row level security;

drop policy if exists "Authenticated users can read batches" on public.batches;
create policy "Authenticated users can read batches"
  on public.batches for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage batches" on public.batches;
create policy "Admins can manage batches"
  on public.batches for all
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
