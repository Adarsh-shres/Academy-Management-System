-- Admin-managed student and teacher profile records plus private profile image storage.

create extension if not exists pgcrypto;

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.student_profiles
  add column if not exists avatar_url text;

create table if not exists public.teacher_profiles (
  teacher_id uuid primary key references public.users(id) on delete cascade,
  employee_id text not null unique,
  department text default '',
  specialization text default '',
  phone text default '',
  status text not null default 'Active' check (status in ('Active', 'On Leave', 'Inactive')),
  avatar_url text,
  location text default '',
  gender text not null default 'Male' check (gender in ('Male', 'Female')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_teacher_profiles_updated_at on public.teacher_profiles;
create trigger set_teacher_profiles_updated_at
  before update on public.teacher_profiles
  for each row
  execute function public.set_updated_at();

insert into public.teacher_profiles (
  teacher_id,
  employee_id,
  department,
  specialization,
  phone,
  status,
  location,
  gender
)
select
  u.id,
  'FAC-' || upper(left(replace(u.id::text, '-', ''), 8)),
  coalesce(au.raw_user_meta_data -> 'profile' ->> 'department', ''),
  coalesce(au.raw_user_meta_data -> 'profile' ->> 'specialization', au.raw_user_meta_data -> 'profile' ->> 'subject', ''),
  coalesce(au.raw_user_meta_data -> 'profile' ->> 'phone', ''),
  coalesce(nullif(au.raw_user_meta_data -> 'profile' ->> 'status', ''), 'Active'),
  coalesce(au.raw_user_meta_data -> 'profile' ->> 'location', ''),
  case when au.raw_user_meta_data -> 'profile' ->> 'gender' = 'Female' then 'Female' else 'Male' end
from public.users u
left join auth.users au on au.id = u.id
where u.role = 'teacher'
on conflict (teacher_id) do nothing;

alter table public.student_profiles enable row level security;
alter table public.teacher_profiles enable row level security;

grant select, insert, update, delete on public.student_profiles to authenticated;
grant select, insert, update, delete on public.teacher_profiles to authenticated;

drop policy if exists "Admins and owners can read student profiles" on public.student_profiles;
create policy "Admins and owners can read student profiles"
  on public.student_profiles
  for select
  to authenticated
  using (student_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage student profiles" on public.student_profiles;
create policy "Admins can manage student profiles"
  on public.student_profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins and owners can read teacher profiles" on public.teacher_profiles;
create policy "Admins and owners can read teacher profiles"
  on public.teacher_profiles
  for select
  to authenticated
  using (teacher_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage teacher profiles" on public.teacher_profiles;
create policy "Admins can manage teacher profiles"
  on public.teacher_profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can read profile images" on storage.objects;
create policy "Admins can read profile images"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'profile-images' and public.is_admin());

drop policy if exists "Owners can read own profile images" on storage.objects;
create policy "Owners can read own profile images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (
      name like 'students/' || auth.uid()::text || '/%'
      or name like 'teachers/' || auth.uid()::text || '/%'
    )
  );

drop policy if exists "Admins can upload profile images" on storage.objects;
create policy "Admins can upload profile images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'profile-images' and public.is_admin());

drop policy if exists "Admins can update profile images" on storage.objects;
create policy "Admins can update profile images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'profile-images' and public.is_admin())
  with check (bucket_id = 'profile-images' and public.is_admin());

drop policy if exists "Admins can delete profile images" on storage.objects;
create policy "Admins can delete profile images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'profile-images' and public.is_admin());
