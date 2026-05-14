import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const teacherClassesPage = readFileSync(new URL('../src/pages/TeacherClassesPage.tsx', import.meta.url), 'utf8');

test('teacher class cards do not show attendance summary badges', () => {
  assert.doesNotMatch(teacherClassesPage, /attendanceMap/);
  assert.doesNotMatch(teacherClassesPage, /% Attend\./);
  assert.doesNotMatch(teacherClassesPage, /\.from\('attendance'\)/);
});

test('teacher class cards do not show virtual as a fallback room', () => {
  assert.doesNotMatch(teacherClassesPage, /'Virtual'/);
  assert.match(teacherClassesPage, /courseRoom &&/);
});

test('teacher classes page loads primary and additional teacher assignments', () => {
  assert.match(teacherClassesPage, /\.or\(`teacher_id\.eq\.\$\{authUser\.id\},teacher_ids\.cs\.\{\$\{authUser\.id\}\}`\)/);
  assert.doesNotMatch(teacherClassesPage, /\.eq\('teacher_id', authUser\.id\)/);
});
