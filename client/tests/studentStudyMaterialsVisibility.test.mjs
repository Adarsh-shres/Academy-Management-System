import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const foldersPage = readFileSync(new URL('../src/pages/StudentFoldersPage.tsx', import.meta.url), 'utf8');
const folderContentsPage = readFileSync(new URL('../src/pages/FolderContentsPage.tsx', import.meta.url), 'utf8');
const studentClassEnrollment = readFileSync(new URL('../src/lib/studentClassEnrollment.ts', import.meta.url), 'utf8');
const contentPolicy = readFileSync(new URL('../../supabase/fix_course_content_student_visibility.sql', import.meta.url), 'utf8');

test('student study material queries are scoped to enrolled class ids', () => {
  for (const source of [foldersPage, folderContentsPage]) {
    assert.match(source, /getStudentClassIdsForCourse\(courseId, user\.id\)/);
    assert.match(source, /\.in\("class_id", classIds\)/);
    assert.doesNotMatch(source, /\.eq\("course_id", courseId\)/);
  }
});

test('student material enrollment lookup includes direct classes and batch classes', () => {
  assert.match(studentClassEnrollment, /\.contains\("student_ids", \[studentId\]\)/);
  assert.match(studentClassEnrollment, /\.from\("batches"\)/);
  assert.match(studentClassEnrollment, /\.in\("batch_id", batchIds\)/);
});

test('course content RLS does not grant student access by course enrollment alone', () => {
  assert.match(contentPolicy, /Students can view enrolled course content/);
  assert.match(contentPolicy, /course_content\.class_id/);
  assert.match(contentPolicy, /c\.student_ids::text\[\]/);
  assert.match(contentPolicy, /b\.student_ids::text\[\]/);
  assert.doesNotMatch(contentPolicy, /from public\.enrollments e/);
});

test('study material SQL lets students resolve their own class and batch ids', () => {
  assert.match(contentPolicy, /grant select on public\.classes to authenticated/);
  assert.match(contentPolicy, /grant select on public\.batches to authenticated/);
  assert.match(contentPolicy, /Students can read their own classes/);
  assert.match(contentPolicy, /Students can read their own batch rows/);
});

test('student materials open in browser preview instead of forcing downloads', () => {
  assert.match(folderContentsPage, /getBrowserPreviewUrl/);
  assert.match(folderContentsPage, /window\.open\(getBrowserPreviewUrl\(fileUrl, fileName\)/);
  assert.match(folderContentsPage, /docs\.google\.com\/viewer/);
  assert.doesNotMatch(folderContentsPage, /\.download =/);
});
