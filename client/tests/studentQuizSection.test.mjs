import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const sidebar = readFileSync(new URL('../src/layouts/Sidebar.tsx', import.meta.url), 'utf8');
const quizzesPageUrl = new URL('../src/pages/StudentQuizzesPage.tsx', import.meta.url);

test('student role exposes a quizzes section', () => {
  assert.match(app, /StudentQuizzesPage/);
  assert.match(app, /path="\/student\/quizzes"/);
  assert.match(sidebar, /name: 'Quizzes'/);
  assert.match(sidebar, /path: '\/student\/quizzes'/);
});

test('student quizzes page loads published quizzes and records attempts', () => {
  assert.equal(existsSync(quizzesPageUrl), true);

  const quizzesPage = readFileSync(quizzesPageUrl, 'utf8');
  assert.match(quizzesPage, /\.from\('quizzes'\)/);
  assert.match(quizzesPage, /\.eq\('is_published', true\)/);
  assert.match(quizzesPage, /\.from\('quiz_submissions'\)/);
  assert.match(quizzesPage, /\.insert\(/);
  assert.match(quizzesPage, /AccessCodeModal/);
});
