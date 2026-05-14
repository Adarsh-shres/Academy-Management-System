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

test('teacher profile backfill normalizes status metadata', () => {
  assert.match(sql, /case\s+when au\.raw_user_meta_data -> 'profile' ->> 'status' in \('Active', 'On Leave', 'Inactive'\)\s+then au\.raw_user_meta_data -> 'profile' ->> 'status'\s+else 'Active'\s+end/i);
});

test('visual companion artifacts are ignored', () => {
  assert.match(gitignore, /^\.superpowers\/$/m);
});
