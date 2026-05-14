import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const foldersPage = readFileSync(new URL('../src/pages/StudentFoldersPage.tsx', import.meta.url), 'utf8');
const folderContentsPage = readFileSync(new URL('../src/pages/FolderContentsPage.tsx', import.meta.url), 'utf8');
const studentClassEnrollment = readFileSync(new URL('../src/lib/studentClassEnrollment.ts', import.meta.url), 'utf8');

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

test('student materials open in browser preview instead of forcing downloads', () => {
  assert.match(folderContentsPage, /getBrowserPreviewUrl/);
  assert.match(folderContentsPage, /window\.open\(getBrowserPreviewUrl\(fileUrl, fileName\)/);
  assert.match(folderContentsPage, /docs\.google\.com\/viewer/);
  assert.doesNotMatch(folderContentsPage, /\.download =/);
});
