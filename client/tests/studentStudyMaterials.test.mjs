import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const studentFoldersPage = readFileSync(new URL('../src/pages/StudentFoldersPage.tsx', import.meta.url), 'utf8');
const folderContentsPage = readFileSync(new URL('../src/pages/FolderContentsPage.tsx', import.meta.url), 'utf8');

function courseContentQuery(source) {
  const [, query = ''] = source.split('.from("course_content")');
  return query.split('if (contentError)')[0];
}

test('student study material folders are loaded from accessible class content', () => {
  const query = courseContentQuery(studentFoldersPage);
  assert.match(query, /\.in\("class_id", classIds\)/);
  assert.doesNotMatch(query, /\.eq\("course_id", courseId\)/);
});

test('student folder contents are loaded from accessible class content and selected week', () => {
  const query = courseContentQuery(folderContentsPage);
  assert.match(query, /\.eq\("week_number", weekNumber\)/);
  assert.match(query, /\.in\("class_id", classIds\)/);
  assert.doesNotMatch(query, /\.eq\("course_id", courseId\)/);
});
