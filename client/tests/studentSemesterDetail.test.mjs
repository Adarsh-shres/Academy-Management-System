import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const studentTypes = readFileSync(new URL('../src/types/student.ts', import.meta.url), 'utf8');
const studentProfiles = readFileSync(new URL('../src/lib/studentProfiles.ts', import.meta.url), 'utf8');
const registerForm = readFileSync(new URL('../src/components/students/RegisterStudentForm.tsx', import.meta.url), 'utf8');
const editorModal = readFileSync(new URL('../src/components/students/StudentEditorModal.tsx', import.meta.url), 'utf8');
const useStudentData = readFileSync(new URL('../src/hooks/useStudentData.ts', import.meta.url), 'utf8');
const createUserFunction = readFileSync(new URL('../../supabase/functions/create-user/index.ts', import.meta.url), 'utf8');
const semesterSqlUrl = new URL('../../add_student_profiles_semester.sql', import.meta.url);

test('student records expose dropdown semester options', () => {
  assert.match(studentTypes, /STUDENT_SEMESTERS/);
  assert.match(studentTypes, /'Semester 1'/);
  assert.match(studentTypes, /'Semester 8'/);
  assert.match(studentTypes, /semester: Semester/);
});

test('student profile persistence reads and writes semester', () => {
  assert.match(studentProfiles, /semester: string \| null/);
  assert.match(studentProfiles, /STUDENT_PROFILE_SELECT[\s\S]*semester/);
  assert.match(studentProfiles, /semester: normalizeStudentSemester\(profile\?\.semester\)/);
  assert.match(studentProfiles, /semester: student\.semester/);
  assert.match(useStudentData, /semester: profileRow\?\.semester \|\| 'Semester not set'/);
});

test('student registration and editing include a semester dropdown', () => {
  assert.match(registerForm, /name="semester"/);
  assert.match(registerForm, /STUDENT_SEMESTERS\.map/);
  assert.match(registerForm, /semester: student\.semester/);
  assert.match(editorModal, /FieldLabel>Semester/);
  assert.match(editorModal, /STUDENT_SEMESTERS\.map/);
});

test('student semester schema and create-user profile include the semester column', () => {
  assert.equal(existsSync(semesterSqlUrl), true);
  const sql = readFileSync(semesterSqlUrl, 'utf8');
  assert.match(sql, /ALTER TABLE public\.student_profiles/);
  assert.match(sql, /ADD COLUMN IF NOT EXISTS semester TEXT/);
  assert.match(createUserFunction, /semester: readProfileString\(profile, 'semester'\)/);
});
