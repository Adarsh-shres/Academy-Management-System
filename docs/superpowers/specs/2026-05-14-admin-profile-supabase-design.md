# Admin Profile Supabase Design

## Goal

Improve admin-managed student and teacher profiles so visible profile fields are backed by Supabase, profile photos are stored in Supabase Storage, and row-level security prevents students or teachers from editing their own profile data.

## Current Problems

- Student profile photos are accepted by the UI but are not uploaded or stored.
- Student profile display omits some table-backed fields, including semester and future avatar data.
- Teacher profiles are mostly generated client-side placeholders: employee IDs, department, specialization, status, totals, and initials are not reliable Supabase-backed profile fields.
- Teacher account creation only captures a weak subset of real faculty information.
- RLS policies exist in several one-off SQL scripts and need stronger, consistent admin-only write rules for role profiles and profile photos.

## Data Model

`public.users` remains the identity and role table:

- `id`
- `email`
- `name`
- `role`

`public.student_profiles` remains the student detail table and gains:

- `avatar_url text`

Existing student fields stay:

- `student_id`
- `father_name`
- `date_of_birth`
- `mobile_no`
- `gender`
- `department`
- `semester`
- `city`
- `address`
- `is_active`
- `date_enrolled`
- timestamps

A new `public.teacher_profiles` table stores faculty details:

- `teacher_id uuid primary key references public.users(id) on delete cascade`
- `employee_id text not null unique`
- `department text default ''`
- `specialization text default ''`
- `phone text default ''`
- `status text not null default 'Active' check in ('Active', 'On Leave', 'Inactive')`
- `avatar_url text`
- `location text default ''`
- `gender text not null default 'Male' check in ('Male', 'Female')`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Existing teacher users are backfilled with deterministic `employee_id` values based on their user UUID. UI-generated employee IDs are removed once real rows exist.

## Storage

Create a private Supabase Storage bucket named `profile-images`.

Path convention:

- `students/{student_id}/{filename}`
- `teachers/{teacher_id}/{filename}`

The app saves the storage object path in the profile table `avatar_url` field. The client creates signed URLs before display so image reads remain covered by Storage RLS.

Allowed image types:

- JPEG
- PNG
- WebP

Recommended size limit:

- 2 MB per uploaded image

## RLS And Authorization

Profile tables:

- Admins and super admins can select, insert, update, and delete all `student_profiles` and `teacher_profiles`.
- Students can select only their own `student_profiles` row.
- Teachers can select only their own `teacher_profiles` row.
- Students and teachers cannot insert, update, or delete profile rows.
- Policies use role data from `public.users`, not editable auth metadata.

Storage objects:

- Admins and super admins can select, insert, update, and delete files under the `profile-images` bucket.
- Students and teachers can select only their own profile photo objects.
- Students and teachers cannot upload, replace, or delete profile photos.
- Upload replacement supports the needed Supabase Storage permissions: select, insert, and update for admin roles.

## Edge Function

The existing `create-user` Edge Function is extended:

- Student creation writes the student profile including `avatar_url` if a photo URL is provided.
- Teacher creation writes a `teacher_profiles` row with employee ID, department, specialization, phone, status, location, gender, and avatar URL.
- Admin and super admin creation rules remain unchanged: admins can create teachers/students, super admins can also create admins.
- The function continues to validate caller role from `public.users`.

Photo upload itself stays in the client before or after provisioning, using the authenticated admin session and Storage RLS.

## Frontend Behavior

Student registration and editing:

- The existing photo input uploads to Supabase Storage.
- `student_profiles.avatar_url` is saved with the uploaded image location.
- Student detail and profile cards render the image when available and fall back to initials otherwise.
- Student detail view shows semester and all table-backed profile fields.

Teacher creation and editing:

- The teacher create modal becomes a complete faculty form.
- Account fields: full name, email, temporary password.
- Profile fields: employee ID, department, specialization, phone, status, profile photo, location, gender.
- The teacher edit modal updates `public.users.name` and `public.teacher_profiles`.
- The teacher list and detail pages render Supabase-backed teacher profile values instead of generated placeholders.
- Teacher photo display falls back to initials when no avatar exists.

Admin user management:

- The user management page remains focused on account identity and role.
- Role-specific profile details are handled in the student and teacher profile flows, avoiding duplicate partial forms.

## Error Handling

- Show clear form errors when profile photo upload fails.
- Do not create or save a profile row that references a failed upload.
- If account creation succeeds but profile creation fails, the Edge Function cleans up the created auth/public user, matching the existing rollback pattern.
- If profile photo upload succeeds but account/profile creation fails, the client attempts to delete the uploaded object and reports any cleanup failure in the visible form error.
- If a profile row lacks an image, use the initials fallback without throwing.

## Testing And Verification

Automated coverage should include:

- Teacher profile mapping from Supabase rows.
- Student profile mapping with `avatar_url` and semester.
- Create-user payload handling for teacher profile fields.
- RLS SQL includes admin-only write policies for profile tables and storage.

Manual verification should include:

- Admin creates a student with a photo and sees it in admin/student profile views.
- Admin creates a teacher with all approved fields and sees those fields in list/detail views.
- Admin edits teacher and student profile photos.
- Student cannot update their own profile row or upload a new profile photo.
- Teacher cannot update their own profile row or upload a new profile photo.
- Admin can replace a profile photo.

## Out Of Scope

- Students and teachers editing their own profiles.
- Teacher office hours, designation, hire date, and biography.
- Reworking unrelated assignment, quiz, attendance, or notification schemas except where profile RLS helper functions are reused.
