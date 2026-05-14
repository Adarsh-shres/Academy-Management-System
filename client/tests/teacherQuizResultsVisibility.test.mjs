import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const quizVisibilitySql = readFileSync(new URL('../../fix_quiz_student_visibility.sql', import.meta.url), 'utf8');
const teacherClassDetailPage = readFileSync(new URL('../src/pages/TeacherClassDetailPage.tsx', import.meta.url), 'utf8');

test('teachers can read submissions for quizzes they teach', () => {
  assert.match(quizVisibilitySql, /Teachers can read quiz submissions for their quizzes/);
  assert.match(quizVisibilitySql, /on public\.quiz_submissions/);
  assert.match(quizVisibilitySql, /for select/);
  assert.match(quizVisibilitySql, /q\.id = quiz_submissions\.quiz_id/);
  assert.match(quizVisibilitySql, /q\.teacher_id = auth\.uid\(\)/);
  assert.match(quizVisibilitySql, /c\.teacher_id = auth\.uid\(\)/);
  assert.match(quizVisibilitySql, /coalesce\(c\.teacher_ids, '\{\}'::uuid\[\]\) @> array\[auth\.uid\(\)\]/);
});

test('quiz visibility policies use uuid arrays for uuid student id columns', () => {
  assert.doesNotMatch(quizVisibilitySql, /coalesce\(b\.student_ids, '\{\}'::text\[\]\)/);
  assert.match(quizVisibilitySql, /coalesce\(b\.student_ids::uuid\[\], '\{\}'::uuid\[\]\) @> array\[auth\.uid\(\)\]/);
});

test('teacher quiz results load submissions before student profiles', () => {
  const [, loadSubmissions = ''] = teacherClassDetailPage.split('const loadQuizSubmissions');
  const queryBlock = loadSubmissions.split('setQuizSubmissions(')[0];
  assert.match(queryBlock, /\.from\('quiz_submissions'\)/);
  assert.match(queryBlock, /\.select\('\*'\)/);
  assert.doesNotMatch(queryBlock, /users\(name, email\)/);
  assert.match(teacherClassDetailPage, /quizSubmissionsError/);
});
