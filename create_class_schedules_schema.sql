-- Class schedule entries allow admins to create one-off day schedules
-- and recurring weekly schedules for each individual class.
create table if not exists public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  schedule_type text not null default 'weekly'
    check (schedule_type in ('weekly', 'one_time')),
  day_of_week text
    check (day_of_week in ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  schedule_date date,
  start_time time not null,
  end_time time not null,
  room text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (schedule_type = 'weekly' and day_of_week is not null and schedule_date is null)
    or
    (schedule_type = 'one_time' and schedule_date is not null)
  ),
  check (end_time > start_time)
);

create index if not exists class_schedules_class_id_idx
  on public.class_schedules(class_id);

create index if not exists class_schedules_weekly_day_idx
  on public.class_schedules(day_of_week)
  where schedule_type = 'weekly';

create index if not exists class_schedules_date_idx
  on public.class_schedules(schedule_date)
  where schedule_type = 'one_time';

alter table public.class_schedules enable row level security;

drop policy if exists "Authenticated users can read class schedules" on public.class_schedules;
create policy "Authenticated users can read class schedules"
  on public.class_schedules for select
  to authenticated
  using (true);

drop policy if exists "Admins can manage class schedules" on public.class_schedules;
create policy "Admins can manage class schedules"
  on public.class_schedules for all
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
