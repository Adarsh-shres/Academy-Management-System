import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const teacherClassDetailPage = readFileSync(new URL('../src/pages/TeacherClassDetailPage.tsx', import.meta.url), 'utf8');

test('teacher quiz results load submissions before student profiles', () => {
  const [, loadSubmissions = ''] = teacherClassDetailPage.split('const loadQuizSubmissions');
  const queryBlock = loadSubmissions.split('setQuizSubmissions(')[0];
  assert.match(queryBlock, /\.from\('quiz_submissions'\)/);
  assert.match(queryBlock, /\.select\('\*'\)/);
  assert.doesNotMatch(queryBlock, /users\(name, email\)/);
  assert.match(teacherClassDetailPage, /quizSubmissionsError/);
});
