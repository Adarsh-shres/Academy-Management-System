# Admin Profile Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin-managed student and teacher profiles backed by Supabase tables, private Storage photos, and admin-only write RLS.

**Architecture:** Keep `public.users` as identity/role data, extend `student_profiles` with `avatar_url`, and add `teacher_profiles` for faculty-specific fields. Upload photos to a private `profile-images` bucket from admin client sessions, store object paths in profile rows, and resolve signed URLs for display.

**Tech Stack:** React 19, Vite, TypeScript, Supabase JS v2, Supabase Edge Functions, Postgres RLS, Supabase Storage, Node test runner.

---

## File Structure

- Create `supabase/admin_profile_storage_schema.sql`: one runnable SQL script for profile schema, Storage bucket, helper functions, triggers, backfills, grants, and RLS policies.
- Create `client/src/lib/profileImages.ts`: shared Storage upload/delete/signed URL helpers.
- Create `client/src/lib/teacherProfiles.ts`: teacher profile mapping, defaults, and Supabase payload builders.
- Modify `client/src/types/student.ts`: add `avatarUrl` to stored student records.
- Modify `client/src/types/teacher.ts`: add real Supabase-backed teacher fields.
- Modify `client/src/lib/studentProfiles.ts`: select, map, and upsert `avatar_url`.
- Modify `client/src/context/StudentContext.tsx`: upload optional avatar files and persist `avatar_url`.
- Modify `client/src/context/TeacherContext.tsx`: load and save `teacher_profiles`; stop using generated placeholder profile data.
- Modify `client/src/components/students/RegisterStudentForm.tsx`: upload student photo after provisioning and patch `student_profiles.avatar_url`.
- Modify `client/src/components/students/StudentEditorModal.tsx`: allow admin photo replacement during student edits.
- Modify `client/src/pages/StudentDetailsPage.tsx`, `client/src/pages/StudentProfilePage.tsx`, and `client/src/hooks/useStudentData.ts`: render signed profile images and show semester/profile fields.
- Modify `client/src/pages/TeachersPage.tsx`: replace weak teacher form with full faculty profile create/edit flow.
- Modify `supabase/functions/create-user/index.ts`: create `teacher_profiles` rows and accept optional `avatar_url` for student/teacher profiles.
- Create `client/tests/adminProfileSchema.test.mjs`: static coverage for schema/RLS/storage requirements.
- Create `client/tests/adminProfileFeature.test.mjs`: static coverage for frontend and Edge Function integration points.
- Modify `.gitignore`: ignore `.superpowers/` visual companion artifacts.

---

### Task 1: Add Profile Schema, Storage Bucket, And RLS

**Files:**
- Create: `supabase/admin_profile_storage_schema.sql`
- Create: `client/tests/adminProfileSchema.test.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Write the failing schema test**

Create `client/tests/adminProfileSchema.test.mjs` with:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const sql = readFileSync(new URL('../../supabase/admin_profile_storage_schema.sql', import.meta.url), 'utf8');
const gitignore = readFileSync(new URL('../../.gitignore', import.meta.url), 'utf8');

test('admin profile schema creates teacher profiles and student avatars', () => {
  assert.match(sql, /alter table public\.student_profiles[\s\S]*add column if not exists avatar_url text/i);
  assert.match(sql, /create table if not exists public\.teacher_profiles/i);
  assert.match(sql, /employee_id text not null unique/i);
  assert.match(sql, /status text not null default 'Active'/i);
  assert.match(sql, /gender text not null default 'Male'/i);
});

test('admin profile schema creates private storage bucket and object policies', () => {
  assert.match(sql, /insert into storage\.buckets/i);
  assert.match(sql, /'profile-images'/);
  assert.match(sql, /public = false/i);
  assert.match(sql, /create policy "Admins can upload profile images"/i);
  assert.match(sql, /create policy "Owners can read own profile images"/i);
  assert.match(sql, /name like 'students\/' \|\| auth\.uid\(\)::text \|\| '\/%'/i);
  assert.match(sql, /name like 'teachers\/' \|\| auth\.uid\(\)::text \|\| '\/%'/i);
});

test('admin profile schema has admin-only write policies', () => {
  assert.match(sql, /create or replace function public\.is_admin\(\)/i);
  assert.match(sql, /create policy "Admins can manage student profiles"/i);
  assert.match(sql, /create policy "Admins can manage teacher profiles"/i);
  assert.match(sql, /with check \(public\.is_admin\(\)\)/i);
});

test('visual companion artifacts are ignored', () => {
  assert.match(gitignore, /^\.superpowers\/$/m);
});
```

- [ ] **Step 2: Run the schema test to verify it fails**

Run:

```bash
cd client
node --test tests/adminProfileSchema.test.mjs
```

Expected: FAIL because `supabase/admin_profile_storage_schema.sql` does not exist and `.superpowers/` is not ignored yet.

- [ ] **Step 3: Add `.superpowers/` to `.gitignore`**

Append this line to `.gitignore`:

```gitignore
.superpowers/
```

- [ ] **Step 4: Create the schema SQL**

Create `supabase/admin_profile_storage_schema.sql` with:

```sql
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
```

- [ ] **Step 5: Run the schema test to verify it passes**

Run:

```bash
cd client
node --test tests/adminProfileSchema.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit schema work**

Run:

```bash
git add .gitignore supabase/admin_profile_storage_schema.sql client/tests/adminProfileSchema.test.mjs
git commit -m "feat: add admin profile schema and storage rls"
```

Expected: commit succeeds.

---

### Task 2: Add Shared Profile Image Helpers

**Files:**
- Create: `client/src/lib/profileImages.ts`
- Create: `client/tests/adminProfileFeature.test.mjs`

- [ ] **Step 1: Write the failing image helper test**

Create `client/tests/adminProfileFeature.test.mjs` with:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const profileImages = readFileSync(new URL('../src/lib/profileImages.ts', import.meta.url), 'utf8');

test('profile image helper uses private profile-images bucket with signed urls', () => {
  assert.match(profileImages, /PROFILE_IMAGE_BUCKET = 'profile-images'/);
  assert.match(profileImages, /type ProfileImageOwner = 'students' \| 'teachers'/);
  assert.match(profileImages, /createSignedUrl\(path, 60 \* 60\)/);
  assert.match(profileImages, /\.upload\(path, file,/);
  assert.match(profileImages, /file\.size > MAX_PROFILE_IMAGE_BYTES/);
  assert.match(profileImages, /image\/jpeg/);
  assert.match(profileImages, /image\/png/);
  assert.match(profileImages, /image\/webp/);
});
```

- [ ] **Step 2: Run the feature test to verify it fails**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
```

Expected: FAIL because `client/src/lib/profileImages.ts` does not exist.

- [ ] **Step 3: Create the profile image helper**

Create `client/src/lib/profileImages.ts` with:

```ts
import { supabase } from './supabase';

export const PROFILE_IMAGE_BUCKET = 'profile-images';
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type ProfileImageOwner = 'students' | 'teachers';

function extensionForType(type: string) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

export function validateProfileImage(file: File) {
  if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_PROFILE_IMAGE_TYPES)[number])) {
    throw new Error('Profile photo must be a JPEG, PNG, or WebP image.');
  }

  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error('Profile photo must be 2 MB or smaller.');
  }
}

export async function uploadProfileImage(owner: ProfileImageOwner, userId: string, file: File) {
  validateProfileImage(file);

  const extension = extensionForType(file.type);
  const path = `${owner}/${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(PROFILE_IMAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function getSignedProfileImageUrl(path: string | null | undefined) {
  if (!path) return '';

  const { data, error } = await supabase.storage.from(PROFILE_IMAGE_BUCKET).createSignedUrl(path, 60 * 60);

  if (error) {
    console.error('[profileImages] Failed to create signed profile image URL:', error.message);
    return '';
  }

  return data.signedUrl;
}

export async function deleteProfileImage(path: string | null | undefined) {
  if (!path) return;

  const { error } = await supabase.storage.from(PROFILE_IMAGE_BUCKET).remove([path]);

  if (error) {
    throw new Error(error.message);
  }
}
```

- [ ] **Step 4: Run the feature test**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run TypeScript build**

Run:

```bash
cd client
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit image helper work**

Run:

```bash
git add client/src/lib/profileImages.ts client/tests/adminProfileFeature.test.mjs
git commit -m "feat: add profile image storage helpers"
```

Expected: commit succeeds.

---

### Task 3: Persist And Render Student Profile Photos

**Files:**
- Modify: `client/src/types/student.ts`
- Modify: `client/src/lib/studentProfiles.ts`
- Modify: `client/src/context/StudentContext.tsx`
- Modify: `client/src/components/students/RegisterStudentForm.tsx`
- Modify: `client/src/components/students/StudentEditorModal.tsx`
- Modify: `client/src/pages/StudentDetailsPage.tsx`
- Modify: `client/src/hooks/useStudentData.ts`
- Modify: `client/src/pages/StudentProfilePage.tsx`
- Modify: `client/tests/adminProfileFeature.test.mjs`
- Modify: `client/tests/studentSemesterDetail.test.mjs`

- [ ] **Step 1: Extend feature tests for student avatars**

Append these tests to `client/tests/adminProfileFeature.test.mjs`:

```js
const studentTypes = readFileSync(new URL('../src/types/student.ts', import.meta.url), 'utf8');
const studentProfiles = readFileSync(new URL('../src/lib/studentProfiles.ts', import.meta.url), 'utf8');
const studentContext = readFileSync(new URL('../src/context/StudentContext.tsx', import.meta.url), 'utf8');
const registerForm = readFileSync(new URL('../src/components/students/RegisterStudentForm.tsx', import.meta.url), 'utf8');
const studentEditor = readFileSync(new URL('../src/components/students/StudentEditorModal.tsx', import.meta.url), 'utf8');
const studentDetails = readFileSync(new URL('../src/pages/StudentDetailsPage.tsx', import.meta.url), 'utf8');
const useStudentData = readFileSync(new URL('../src/hooks/useStudentData.ts', import.meta.url), 'utf8');
const studentProfilePage = readFileSync(new URL('../src/pages/StudentProfilePage.tsx', import.meta.url), 'utf8');

test('student profile flow persists avatar_url and uploads images after provisioning', () => {
  assert.match(studentTypes, /avatarUrl: string/);
  assert.match(studentProfiles, /avatar_url: string \| null/);
  assert.match(studentProfiles, /STUDENT_PROFILE_SELECT[\s\S]*avatar_url/);
  assert.match(studentProfiles, /avatarUrl: profile\?\.avatar_url \?\? ''/);
  assert.match(studentProfiles, /avatar_url: student\.avatarUrl \|\| null/);
  assert.match(registerForm, /uploadProfileImage\('students', response\.user_id, student\.photo\)/);
  assert.match(registerForm, /\.from\('student_profiles'\)[\s\S]*avatar_url: avatarPath/);
  assert.match(studentContext, /uploadProfileImage\('students', id, avatarFile\)/);
  assert.match(studentEditor, /type="file"/);
  assert.match(studentDetails, /student\.avatarUrl/);
  assert.match(useStudentData, /getSignedProfileImageUrl\(profileRow\?\.avatar_url\)/);
  assert.match(studentProfilePage, /studentProfile\.avatarUrl/);
});
```

Update `client/tests/studentSemesterDetail.test.mjs` by adding:

```js
test('student profile persistence reads and writes avatar url', () => {
  assert.match(studentProfiles, /avatar_url: string \| null/);
  assert.match(studentProfiles, /STUDENT_PROFILE_SELECT[\s\S]*avatar_url/);
  assert.match(studentProfiles, /avatarUrl: profile\?\.avatar_url \?\? ''/);
  assert.match(studentProfiles, /avatar_url: student\.avatarUrl \|\| null/);
});
```

- [ ] **Step 2: Run student avatar tests to verify they fail**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs tests/studentSemesterDetail.test.mjs
```

Expected: FAIL because student avatar fields and upload calls are not implemented.

- [ ] **Step 3: Update student types and mapping**

Modify `client/src/types/student.ts`:

```ts
export interface StudentRecord extends Omit<StudentFormData, 'photo'> {
  id: string;
  course: string;
  isActive: boolean;
  dateEnrolled: string;
  avatarUrl: string;
}
```

Modify `client/src/lib/studentProfiles.ts` so the row, select, mapper, and upsert include `avatar_url`:

```ts
export interface StudentProfileRow {
  student_id: string;
  father_name: string | null;
  date_of_birth: string | null;
  mobile_no: string | null;
  gender: string | null;
  department: string | null;
  semester: string | null;
  city: string | null;
  address: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  date_enrolled: string | null;
}

export const STUDENT_PROFILE_SELECT =
  'student_id, father_name, date_of_birth, mobile_no, gender, department, semester, city, address, avatar_url, is_active, date_enrolled';
```

Inside `mapStudentRecord`, add:

```ts
avatarUrl: profile?.avatar_url ?? '',
```

Inside `buildStudentProfileUpsert`, add:

```ts
avatar_url: student.avatarUrl || null,
```

- [ ] **Step 4: Update student context for avatar uploads**

Modify imports in `client/src/context/StudentContext.tsx`:

```ts
import { uploadProfileImage } from '../lib/profileImages';
```

Change the context type:

```ts
updateStudent: (id: string, data: Partial<StudentRecord>, avatarFile?: File | null) => Promise<void>;
```

In `addStudent`, include:

```ts
avatarUrl: '',
```

Change `updateStudent` to upload the optional file before upserting:

```ts
const avatarUrl = avatarFile ? await uploadProfileImage('students', id, avatarFile) : nextStudent.avatarUrl;

const studentToSave: StudentRecord = {
  ...nextStudent,
  avatarUrl,
};
```

Use `studentToSave` in `buildStudentFullName`, `buildStudentProfileUpsert`, and local state replacement.

- [ ] **Step 5: Update student registration photo flow**

Modify `client/src/components/students/RegisterStudentForm.tsx` imports:

```ts
import { uploadProfileImage } from '../../lib/profileImages';
```

Change `createStudentAccount` to store the response, upload after provisioning, and patch `student_profiles`:

```ts
const response = await provisionUser({
  email: student.email.trim().toLowerCase(),
  password: student.password,
  fullName,
  role: 'student',
  profile: {
    father_name: student.fatherName,
    date_of_birth: student.dateOfBirth,
    mobile_no: student.mobileNo,
    gender: student.gender,
    department: student.department,
    semester: student.semester,
    city: student.city,
    address: student.address,
  },
});

if (student.photo && response.user_id) {
  const avatarPath = await uploadProfileImage('students', response.user_id, student.photo);
  const { error: avatarError } = await supabase
    .from('student_profiles')
    .update({ avatar_url: avatarPath })
    .eq('student_id', response.user_id);

  if (avatarError) {
    throw new Error(avatarError.message);
  }
}
```

Add this import:

```ts
import { supabase } from '../../lib/supabase';
```

- [ ] **Step 6: Update student editor photo replacement**

Modify `StudentEditorModalProps` in `client/src/components/students/StudentEditorModal.tsx`:

```ts
onSave: (student: StudentRecord, avatarFile?: File | null) => void | Promise<void>;
```

Add state:

```ts
const [avatarFile, setAvatarFile] = useState<File | null>(null);
```

In the submit handler, call:

```ts
onSave(draft, avatarFile);
```

Add a photo field in the form:

```tsx
<div className="grid gap-2">
  <FieldLabel>Profile Photo</FieldLabel>
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
    className="w-full rounded-2xl border border-dashed border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#64748b] file:mr-4 file:rounded-xl file:border-0 file:bg-[#f3eff7] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[#6a5182] hover:file:bg-[#e7dff0]"
  />
</div>
```

Update `StudentDetailsPage.tsx` and `AllStudentsPage.tsx` `onSave` callbacks to pass the file:

```tsx
onSave={async (updatedStudent, avatarFile) => {
  setSaveError('');
  await updateStudent(updatedStudent.id, updatedStudent, avatarFile);
  setEditingStudent(null);
}}
```

- [ ] **Step 7: Render student profile images**

In `client/src/pages/StudentDetailsPage.tsx`, replace the initials-only block with:

```tsx
{student.avatarUrl ? (
  <img src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} className="h-full w-full object-cover" />
) : (
  <>
    {student.firstName[0]}
    {student.lastName[0]}
  </>
)}
```

In `client/src/hooks/useStudentData.ts`, import:

```ts
import { getSignedProfileImageUrl } from '../lib/profileImages';
```

Add `avatarUrl` to `StudentProfileData`:

```ts
avatarUrl: string;
```

Before `setProfile`, resolve:

```ts
const avatarUrl = await getSignedProfileImageUrl(profileRow?.avatar_url);
```

Set:

```ts
avatarUrl,
```

In `client/src/pages/StudentProfilePage.tsx`, render image first:

```tsx
{studentProfile.avatarUrl ? (
  <img src={studentProfile.avatarUrl} alt={studentProfile.name} className="h-full w-full object-cover" />
) : (
  studentProfile.avatar
)}
```

- [ ] **Step 8: Run tests and build**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs tests/studentSemesterDetail.test.mjs
npm run build
```

Expected: both tests PASS and build PASS.

- [ ] **Step 9: Commit student avatar work**

Run:

```bash
git add client/src/types/student.ts client/src/lib/studentProfiles.ts client/src/context/StudentContext.tsx client/src/components/students/RegisterStudentForm.tsx client/src/components/students/StudentEditorModal.tsx client/src/pages/StudentDetailsPage.tsx client/src/pages/AllStudentsPage.tsx client/src/hooks/useStudentData.ts client/src/pages/StudentProfilePage.tsx client/tests/adminProfileFeature.test.mjs client/tests/studentSemesterDetail.test.mjs
git commit -m "feat: persist student profile photos"
```

Expected: commit succeeds.

---

### Task 4: Add Teacher Profile Mapping And Persistence

**Files:**
- Modify: `client/src/types/teacher.ts`
- Create: `client/src/lib/teacherProfiles.ts`
- Modify: `client/src/context/TeacherContext.tsx`
- Modify: `client/tests/adminProfileFeature.test.mjs`

- [ ] **Step 1: Extend feature tests for teacher profile helpers**

Append to `client/tests/adminProfileFeature.test.mjs`:

```js
const teacherTypes = readFileSync(new URL('../src/types/teacher.ts', import.meta.url), 'utf8');
const teacherProfiles = readFileSync(new URL('../src/lib/teacherProfiles.ts', import.meta.url), 'utf8');
const teacherContext = readFileSync(new URL('../src/context/TeacherContext.tsx', import.meta.url), 'utf8');

test('teacher profiles map Supabase-backed faculty fields', () => {
  assert.match(teacherTypes, /email: string/);
  assert.match(teacherTypes, /employeeId: string/);
  assert.match(teacherTypes, /phone: string/);
  assert.match(teacherTypes, /location: string/);
  assert.match(teacherTypes, /gender: TeacherGender/);
  assert.match(teacherTypes, /avatarUrl: string/);
  assert.match(teacherProfiles, /TEACHER_PROFILE_SELECT/);
  assert.match(teacherProfiles, /employee_id, department, specialization, phone, status, avatar_url, location, gender/);
  assert.match(teacherProfiles, /mapTeacherRecord/);
  assert.match(teacherProfiles, /buildTeacherProfileUpsert/);
  assert.match(teacherContext, /\.from\('teacher_profiles'\)/);
  assert.match(teacherContext, /uploadProfileImage\('teachers', id, avatarFile\)/);
});
```

- [ ] **Step 2: Run the feature test to verify it fails**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
```

Expected: FAIL because teacher profile types/helpers are not implemented.

- [ ] **Step 3: Update teacher types**

Modify `client/src/types/teacher.ts`:

```ts
export type TeacherStatus = 'Active' | 'On Leave' | 'Inactive';
export type TeacherGender = 'Male' | 'Female';

export interface Teacher {
  id: string;
  email: string;
  name: string;
  initials: string;
  subject: string;
  department: string;
  employeeId: string;
  phone: string;
  status: TeacherStatus;
  location: string;
  gender: TeacherGender;
  avatarUrl: string;
  avatarGradient: string;
  totalClasses: number;
  totalStudents: number;
  avgAttendance: number;
  upcomingSessions: number;
  schedule: TeacherScheduleItem[];
  activities: TeacherActivityItem[];
}
```

- [ ] **Step 4: Create teacher profile helper**

Create `client/src/lib/teacherProfiles.ts` with:

```ts
import type { Teacher, TeacherGender, TeacherStatus } from '../types/teacher';

export interface SupabaseTeacherUserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
}

export interface TeacherProfileRow {
  teacher_id: string;
  employee_id: string | null;
  department: string | null;
  specialization: string | null;
  phone: string | null;
  status: string | null;
  avatar_url: string | null;
  location: string | null;
  gender: string | null;
}

export const TEACHER_PROFILE_SELECT =
  'teacher_id, employee_id, department, specialization, phone, status, avatar_url, location, gender';

const GRADIENTS = [
  'from-[#0ea5b0] to-[#006496]',
  'from-[#164e6a] to-[#0d3349]',
  'from-[#fbbf24] to-[#d97706]',
  'from-[#f87171] to-[#ef4444]',
];

export function getTeacherInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'TC'
  );
}

export function gradientForTeacherId(id: string) {
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return GRADIENTS[charCode % GRADIENTS.length];
}

export function normalizeTeacherStatus(value: string | null | undefined): TeacherStatus {
  return value === 'On Leave' || value === 'Inactive' ? value : 'Active';
}

export function normalizeTeacherGender(value: string | null | undefined): TeacherGender {
  return value === 'Female' ? 'Female' : 'Male';
}

export function defaultTeacherEmployeeId(id: string) {
  return `FAC-${id.replaceAll('-', '').slice(0, 8).toUpperCase()}`;
}

export function mapTeacherRecord(row: SupabaseTeacherUserRow, profile?: TeacherProfileRow | null): Teacher | null {
  if (row.role !== 'teacher') return null;

  const name = row.name?.trim() || 'Unnamed Teacher';

  return {
    id: row.id,
    email: row.email ?? '',
    name,
    initials: getTeacherInitials(name),
    subject: profile?.specialization || 'Not assigned yet',
    department: profile?.department || 'Not set',
    employeeId: profile?.employee_id || defaultTeacherEmployeeId(row.id),
    phone: profile?.phone || '',
    status: normalizeTeacherStatus(profile?.status),
    location: profile?.location || '',
    gender: normalizeTeacherGender(profile?.gender),
    avatarUrl: profile?.avatar_url || '',
    avatarGradient: gradientForTeacherId(row.id),
    totalClasses: 0,
    totalStudents: 0,
    avgAttendance: 0,
    upcomingSessions: 0,
    schedule: [],
    activities: [],
  };
}

export function buildTeacherProfileUpsert(teacher: Teacher) {
  return {
    teacher_id: teacher.id,
    employee_id: teacher.employeeId.trim() || defaultTeacherEmployeeId(teacher.id),
    department: teacher.department.trim(),
    specialization: teacher.subject.trim(),
    phone: teacher.phone.trim(),
    status: teacher.status,
    avatar_url: teacher.avatarUrl || null,
    location: teacher.location.trim(),
    gender: teacher.gender,
  };
}
```

- [ ] **Step 5: Update teacher context**

Modify `client/src/context/TeacherContext.tsx` imports:

```ts
import { uploadProfileImage } from '../lib/profileImages';
import {
  buildTeacherProfileUpsert,
  mapTeacherRecord,
  TEACHER_PROFILE_SELECT,
  type SupabaseTeacherUserRow,
  type TeacherProfileRow,
} from '../lib/teacherProfiles';
```

Change `TeacherContextValue`:

```ts
updateTeacher: (id: string, data: Partial<Teacher>, avatarFile?: File | null) => Promise<void>;
```

Replace `refreshTeachers` with a two-query profile load:

```ts
const { data, error } = await supabase
  .from('users')
  .select('id, email, name, role')
  .eq('role', 'teacher')
  .order('name', { ascending: true });

if (error) {
  console.error('[TeacherContext] Failed to load teachers:', error.message);
  setTeachers([]);
  return;
}

const teacherRows = (data as SupabaseTeacherUserRow[]) ?? [];
let profileMap = new Map<string, TeacherProfileRow>();

if (teacherRows.length > 0) {
  const { data: profileRows, error: profileError } = await supabase
    .from('teacher_profiles')
    .select(TEACHER_PROFILE_SELECT)
    .in('teacher_id', teacherRows.map((teacher) => teacher.id));

  if (profileError && profileError.code !== '42P01') {
    console.error('[TeacherContext] Failed to load teacher profiles:', profileError.message);
  } else {
    profileMap = new Map(((profileRows as TeacherProfileRow[] | null) ?? []).map((profile) => [profile.teacher_id, profile]));
  }
}

const mapped = teacherRows
  .map((row) => mapTeacherRecord(row, profileMap.get(row.id)))
  .filter((teacher): teacher is Teacher => Boolean(teacher));

setTeachers(mapped);
```

Replace `updateTeacher` with an async Supabase update:

```ts
const updateTeacher = useCallback(
  async (id: string, data: Partial<Teacher>, avatarFile?: File | null) => {
    const currentTeacher = teachers.find((teacher) => teacher.id === id);
    if (!currentTeacher) return;

    const nextTeacher: Teacher = {
      ...currentTeacher,
      ...data,
      id,
      email: currentTeacher.email,
    };

    const avatarUrl = avatarFile ? await uploadProfileImage('teachers', id, avatarFile) : nextTeacher.avatarUrl;
    const teacherToSave = {
      ...nextTeacher,
      avatarUrl,
    };

    const { error: userError } = await supabase
      .from('users')
      .update({ name: teacherToSave.name })
      .eq('id', id);

    if (userError) throw new Error(userError.message);

    const { error: profileError } = await supabase
      .from('teacher_profiles')
      .upsert(buildTeacherProfileUpsert(teacherToSave), { onConflict: 'teacher_id' });

    if (profileError) throw new Error(profileError.message);

    setTeachers((prev) => prev.map((teacher) => (teacher.id === id ? teacherToSave : teacher)));
  },
  [teachers],
);
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit teacher profile mapping work**

Run:

```bash
git add client/src/types/teacher.ts client/src/lib/teacherProfiles.ts client/src/context/TeacherContext.tsx client/tests/adminProfileFeature.test.mjs
git commit -m "feat: load teacher profiles from supabase"
```

Expected: commit succeeds.

---

### Task 5: Extend Create User Edge Function For Teacher Profiles

**Files:**
- Modify: `supabase/functions/create-user/index.ts`
- Modify: `client/tests/adminProfileFeature.test.mjs`

- [ ] **Step 1: Extend the Edge Function static test**

Append to `client/tests/adminProfileFeature.test.mjs`:

```js
const createUserFunction = readFileSync(new URL('../../supabase/functions/create-user/index.ts', import.meta.url), 'utf8');

test('create-user edge function writes student and teacher avatar/profile fields', () => {
  assert.match(createUserFunction, /avatar_url: readProfileString\(profile, 'avatar_url'\) \|\| null/);
  assert.match(createUserFunction, /if \(targetRole === 'teacher'\)/);
  assert.match(createUserFunction, /\.from\('teacher_profiles'\)\.upsert/);
  assert.match(createUserFunction, /employee_id: readProfileString\(profile, 'employee_id'\)/);
  assert.match(createUserFunction, /specialization: readProfileString\(profile, 'specialization'\)/);
  assert.match(createUserFunction, /phone: readProfileString\(profile, 'phone'\)/);
  assert.match(createUserFunction, /location: readProfileString\(profile, 'location'\)/);
  assert.match(createUserFunction, /gender: readProfileGender\(profile\)/);
  assert.match(createUserFunction, /status: readTeacherStatus\(profile\)/);
});
```

- [ ] **Step 2: Run the Edge Function test to verify it fails**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
```

Expected: FAIL because teacher profile creation is not implemented in the Edge Function.

- [ ] **Step 3: Add profile readers**

In `supabase/functions/create-user/index.ts`, replace `readStudentGender` with:

```ts
function readProfileGender(profile: Record<string, unknown>) {
  return profile.gender === 'Female' ? 'Female' : 'Male';
}

function readTeacherStatus(profile: Record<string, unknown>) {
  return profile.status === 'On Leave' || profile.status === 'Inactive' ? profile.status : 'Active';
}

function defaultEmployeeId(userId: string) {
  return `FAC-${userId.replaceAll('-', '').slice(0, 8).toUpperCase()}`;
}
```

Update the student profile upsert gender line:

```ts
gender: readProfileGender(profile),
avatar_url: readProfileString(profile, 'avatar_url') || null,
```

- [ ] **Step 4: Add teacher profile creation and rollback**

After the student profile block, add:

```ts
if (targetRole === 'teacher') {
  const employeeId = readProfileString(profile, 'employee_id') || defaultEmployeeId(createdUser.id);

  const { error: teacherProfileError } = await supabaseAdmin.from('teacher_profiles').upsert(
    {
      teacher_id: createdUser.id,
      employee_id: employeeId,
      department: readProfileString(profile, 'department'),
      specialization: readProfileString(profile, 'specialization') || readProfileString(profile, 'subject'),
      phone: readProfileString(profile, 'phone'),
      status: readTeacherStatus(profile),
      avatar_url: readProfileString(profile, 'avatar_url') || null,
      location: readProfileString(profile, 'location'),
      gender: readProfileGender(profile),
    },
    { onConflict: 'teacher_id' },
  );

  if (teacherProfileError) {
    await supabaseAdmin.from('users').delete().eq('id', createdUser.id);
    await supabaseAdmin.auth.admin.deleteUser(createdUser.id);
    throw teacherProfileError;
  }
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs tests/studentSemesterDetail.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit Edge Function work**

Run:

```bash
git add supabase/functions/create-user/index.ts client/tests/adminProfileFeature.test.mjs
git commit -m "feat: provision teacher profile records"
```

Expected: commit succeeds.

---

### Task 6: Replace Teacher Create/Edit UI With Real Profile Form

**Files:**
- Modify: `client/src/pages/TeachersPage.tsx`
- Modify: `client/tests/adminProfileFeature.test.mjs`

- [ ] **Step 1: Extend UI static tests**

Append to `client/tests/adminProfileFeature.test.mjs`:

```js
const teachersPage = readFileSync(new URL('../src/pages/TeachersPage.tsx', import.meta.url), 'utf8');

test('teacher page creates and edits full teacher profile fields', () => {
  assert.match(teachersPage, /newEmployeeId/);
  assert.match(teachersPage, /newPhone/);
  assert.match(teachersPage, /newLocation/);
  assert.match(teachersPage, /newGender/);
  assert.match(teachersPage, /newAvatarFile/);
  assert.match(teachersPage, /employee_id: newEmployeeId/);
  assert.match(teachersPage, /specialization: newSubject/);
  assert.match(teachersPage, /phone: newPhone/);
  assert.match(teachersPage, /location: newLocation/);
  assert.match(teachersPage, /gender: newGender/);
  assert.match(teachersPage, /uploadProfileImage\('teachers', response\.user_id, newAvatarFile\)/);
  assert.match(teachersPage, /avatar_url: avatarPath/);
  assert.match(teachersPage, /updateTeacher\(selectedTeacher\.id, updates, editAvatarFile\)/);
});
```

- [ ] **Step 2: Run the UI test to verify it fails**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
```

Expected: FAIL because the teacher UI does not include the full profile form yet.

- [ ] **Step 3: Add teacher create state and imports**

In `client/src/pages/TeachersPage.tsx`, add imports:

```ts
import { uploadProfileImage } from '../lib/profileImages';
import { supabase } from '../lib/supabase';
import type { TeacherGender } from '../types/teacher';
```

Add create state:

```ts
const [newEmployeeId, setNewEmployeeId] = useState('');
const [newPhone, setNewPhone] = useState('');
const [newLocation, setNewLocation] = useState('');
const [newGender, setNewGender] = useState<TeacherGender>('Male');
const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
```

Add edit state:

```ts
const [editEmployeeId, setEditEmployeeId] = useState('');
const [editPhone, setEditPhone] = useState('');
const [editLocation, setEditLocation] = useState('');
const [editGender, setEditGender] = useState<TeacherGender>('Male');
const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
```

Update `resetAddForm` to clear every new field.

- [ ] **Step 4: Update teacher creation flow**

In `handleAddTeacher`, require employee ID:

```ts
if (!newEmployeeId.trim()) {
  setCreateTeacherError('Employee ID is required.');
  return;
}
```

Send profile data to `provisionUser`:

```ts
const response = await provisionUser({
  email,
  password,
  fullName: name,
  role: 'teacher',
  profile: {
    employee_id: newEmployeeId.trim(),
    department: newDept || 'CSE',
    specialization: newSubject || 'General Studies',
    phone: newPhone.trim(),
    status: 'Active',
    location: newLocation.trim(),
    gender: newGender,
  },
});
```

After provisioning, upload and patch avatar:

```ts
if (newAvatarFile && response.user_id) {
  const avatarPath = await uploadProfileImage('teachers', response.user_id, newAvatarFile);
  const { error: avatarError } = await supabase
    .from('teacher_profiles')
    .update({ avatar_url: avatarPath })
    .eq('teacher_id', response.user_id);

  if (avatarError) {
    throw new Error(avatarError.message);
  }
}
```

- [ ] **Step 5: Update teacher edit flow**

In `openEditModal`, copy all selected teacher fields:

```ts
setEditEmployeeId(selectedTeacher.employeeId);
setEditPhone(selectedTeacher.phone);
setEditLocation(selectedTeacher.location);
setEditGender(selectedTeacher.gender);
setEditAvatarFile(null);
```

Make `handleEditTeacher` async and call context persistence:

```ts
const updates = {
  name: editName,
  subject: editSubject,
  department: editDept,
  status: editStatus,
  employeeId: editEmployeeId,
  phone: editPhone,
  location: editLocation,
  gender: editGender,
  initials,
};

await updateTeacher(selectedTeacher.id, updates, editAvatarFile);
setSelectedTeacher({ ...selectedTeacher, ...updates });
setIsEditModalOpen(false);
```

- [ ] **Step 6: Add form controls and render fields**

Add create controls for employee ID, phone, location, gender, and profile photo with the existing `TeacherField`/`TeacherInput` pattern. Use:

```tsx
<TeacherField label="Employee ID">
  <TeacherInput value={newEmployeeId} onChange={setNewEmployeeId} placeholder="e.g. FAC-2026-001" required />
</TeacherField>
<TeacherField label="Phone">
  <TeacherInput value={newPhone} onChange={setNewPhone} placeholder="Phone number" />
</TeacherField>
<TeacherField label="Location">
  <TeacherInput value={newLocation} onChange={setNewLocation} placeholder="Office or city" />
</TeacherField>
<TeacherField label="Gender">
  <TeacherGenderPicker value={newGender} onChange={setNewGender} />
</TeacherField>
<TeacherField label="Profile Photo">
  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setNewAvatarFile(event.target.files?.[0] ?? null)} className="w-full rounded-2xl border border-dashed border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#64748b] file:mr-4 file:rounded-xl file:border-0 file:bg-[#f3eff7] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[#6a5182] hover:file:bg-[#e7dff0]" />
</TeacherField>
```

Add the same fields to the edit modal using edit state.

Add this component:

```tsx
function TeacherGenderPicker({ value, onChange }: { value: TeacherGender; onChange: (value: TeacherGender) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(['Male', 'Female'] as TeacherGender[]).map((gender) => (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender)}
          className={`rounded-2xl border px-4 py-3 text-[13px] font-bold transition-all ${
            value === gender
              ? 'border-[#6a5182] bg-[#f6f0fb] text-[#6a5182] shadow-sm'
              : 'border-[#dbe4f0] bg-[#fbfdff] text-[#475569] hover:border-[#c7b5db] hover:bg-[#faf7fd]'
          }`}
        >
          {gender}
        </button>
      ))}
    </div>
  );
}
```

Render profile photo in teacher list/detail:

```tsx
{selectedTeacher.avatarUrl ? (
  <img src={selectedTeacher.avatarUrl} alt={selectedTeacher.name} className="h-full w-full object-cover" />
) : (
  selectedTeacher.initials
)}
```

Add detail fields:

```tsx
<DetailField label="Phone" value={selectedTeacher.phone || '-'} />
<DetailField label="Location" value={selectedTeacher.location || '-'} />
<DetailField label="Gender" value={selectedTeacher.gender} />
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit teacher UI work**

Run:

```bash
git add client/src/pages/TeachersPage.tsx client/tests/adminProfileFeature.test.mjs
git commit -m "feat: improve admin teacher profile form"
```

Expected: commit succeeds.

---

### Task 7: Resolve Signed Teacher Avatar URLs

**Files:**
- Modify: `client/src/context/TeacherContext.tsx`
- Modify: `client/tests/adminProfileFeature.test.mjs`

- [ ] **Step 1: Extend feature test for signed teacher URLs**

Append to `client/tests/adminProfileFeature.test.mjs`:

```js
test('teacher context resolves signed avatar urls for private storage', () => {
  assert.match(teacherContext, /getSignedProfileImageUrl/);
  assert.match(teacherContext, /signedAvatarUrl/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
```

Expected: FAIL because teacher signed URL resolution is missing.

- [ ] **Step 3: Resolve signed URLs in teacher context**

Modify the `profileImages` import in `client/src/context/TeacherContext.tsx`:

```ts
import { getSignedProfileImageUrl, uploadProfileImage } from '../lib/profileImages';
```

After mapping teachers, resolve signed URLs:

```ts
const mappedWithImages = await Promise.all(
  mapped.map(async (teacher) => {
    const signedAvatarUrl = await getSignedProfileImageUrl(teacher.avatarUrl);
    return {
      ...teacher,
      avatarUrl: signedAvatarUrl || teacher.avatarUrl,
    };
  }),
);

setTeachers(mappedWithImages);
```

When saving an edited teacher with a new avatar, set the local state to a signed URL:

```ts
const signedAvatarUrl = await getSignedProfileImageUrl(avatarUrl);
const teacherForState = {
  ...teacherToSave,
  avatarUrl: signedAvatarUrl || avatarUrl,
};
```

Use `teacherForState` in `setTeachers`.

- [ ] **Step 4: Run tests and build**

Run:

```bash
cd client
node --test tests/adminProfileFeature.test.mjs
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit signed URL work**

Run:

```bash
git add client/src/context/TeacherContext.tsx client/tests/adminProfileFeature.test.mjs
git commit -m "feat: display private teacher profile images"
```

Expected: commit succeeds.

---

### Task 8: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
cd client
node --test tests/adminProfileSchema.test.mjs tests/adminProfileFeature.test.mjs tests/studentSemesterDetail.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run full client build**

Run:

```bash
cd client
npm run build
```

Expected: PASS.

- [ ] **Step 3: Start the dev server**

Run:

```bash
cd client
npm run dev
```

Expected: Vite prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 4: Manual Supabase verification**

Run `supabase/admin_profile_storage_schema.sql` in the Supabase SQL editor, then verify:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'student_profiles'
  and column_name = 'avatar_url';

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'teacher_profiles'
order by ordinal_position;

select id, public, file_size_limit
from storage.buckets
where id = 'profile-images';
```

Expected:

- First query returns `avatar_url`.
- Second query includes `teacher_id`, `employee_id`, `department`, `specialization`, `phone`, `status`, `avatar_url`, `location`, `gender`.
- Third query returns `profile-images`, `public = false`, and `file_size_limit = 2097152`.

- [ ] **Step 5: Manual UI verification**

In the admin UI:

- Create a student with a valid JPEG/PNG/WebP photo and verify the photo renders in admin and student profile views.
- Edit that student and replace the photo.
- Create a teacher with employee ID, department, specialization, phone, status, location, gender, and photo.
- Verify the teacher list/detail page shows the real Supabase profile fields.
- Edit that teacher and replace the photo.

In the student and teacher roles:

- Verify profile data can be read.
- Verify profile fields and photos cannot be edited by those roles.

- [ ] **Step 6: Final status check**

Run:

```bash
git status --short
```

Expected: only intentional uncommitted files remain, or the worktree is clean after commits.

---

## Self-Review

- Spec coverage: schema, student avatar persistence, teacher profile table, teacher form improvements, Edge Function provisioning, Storage RLS, admin-only writes, signed URL display, and verification are all covered by tasks.
- Placeholder scan: this plan contains no `TBD`, `TODO`, or unbounded "add appropriate" steps.
- Type consistency: `avatarUrl`, `employeeId`, `specialization` as `subject`, `phone`, `location`, `gender`, `status`, and `avatar_url` are used consistently across tasks.
