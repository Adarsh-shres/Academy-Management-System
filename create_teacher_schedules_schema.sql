-- Teacher schedules are separate from class schedules.
-- This migration is safe to re-run and also repairs older partial installs
-- that created teacher_schedules before source_class_schedule_id existed.

create table if not exists public.teacher_schedules (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  source_class_schedule_id uuid references public.class_schedules(id) on delete set null,
  schedule_type text not null default 'weekly'
    check (schedule_type in ('weekly', 'one_time')),
  day_of_week text
    check (day_of_week in ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  schedule_date date,
  start_time time not null,
  end_time time not null,
  title text not null,
  room text,
  notes text,
  is_cancelled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (schedule_type = 'weekly' and day_of_week is not null and schedule_date is null)
    or
    (schedule_type = 'one_time' and schedule_date is not null)
  ),
  check (end_time > start_time)
);

alter table public.teacher_schedules
  add column if not exists source_class_schedule_id uuid references public.class_schedules(id) on delete set null;

alter table public.teacher_schedules
  add column if not exists is_cancelled boolean not null default false;

create index if not exists teacher_schedules_teacher_id_idx
  on public.teacher_schedules(teacher_id);

create index if not exists teacher_schedules_class_id_idx
  on public.teacher_schedules(class_id);

create index if not exists teacher_schedules_source_class_schedule_id_idx
  on public.teacher_schedules(source_class_schedule_id);

create index if not exists teacher_schedules_weekly_day_idx
  on public.teacher_schedules(day_of_week)
  where schedule_type = 'weekly';

create index if not exists teacher_schedules_date_idx
  on public.teacher_schedules(schedule_date)
  where schedule_type = 'one_time';

alter table public.teacher_schedules enable row level security;

drop policy if exists "Teachers and admins can read teacher schedules" on public.teacher_schedules;
drop policy if exists "Authenticated users can read teacher schedules" on public.teacher_schedules;
create policy "Authenticated users can read teacher schedules"
  on public.teacher_schedules for select
  to authenticated
  using (
    teacher_id = auth.uid()
    or exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role in ('super_admin', 'admin')
    )
  );

drop policy if exists "Teachers and admins can manage teacher schedules" on public.teacher_schedules;
drop policy if exists "Teachers can manage their own schedules" on public.teacher_schedules;
create policy "Teachers can manage their own schedules"
  on public.teacher_schedules for all
  to authenticated
  using (
    teacher_id = auth.uid()
    or exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role in ('super_admin', 'admin')
    )
  )
  with check (
    teacher_id = auth.uid()
    or exists (
      select 1
      from public.users
      where users.id = auth.uid()
        and users.role in ('super_admin', 'admin')
    )
  );

insert into public.teacher_schedules (
  teacher_id,
  class_id,
  source_class_schedule_id,
  schedule_type,
  day_of_week,
  schedule_date,
  start_time,
  end_time,
  title,
  room,
  notes
)
select
  assigned.teacher_id,
  cls.id,
  cs.id,
  cs.schedule_type,
  cs.day_of_week,
  cs.schedule_date,
  cs.start_time,
  cs.end_time,
  coalesce(cls.name, b.name, 'Class') as title,
  cs.room,
  cs.notes
from public.class_schedules cs
join public.classes cls on cls.id = cs.class_id
left join public.batches b on b.id = cls.batch_id
cross join lateral unnest(
  coalesce(
    nullif(cls.teacher_ids, '{}'::uuid[]),
    case when cls.teacher_id is not null then array[cls.teacher_id] else '{}'::uuid[] end
  )
) as assigned(teacher_id)
where not exists (
  select 1
  from public.teacher_schedules ts
  where ts.teacher_id = assigned.teacher_id
    and ts.source_class_schedule_id = cs.id
);
