import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const assignmentCard = readFileSync(new URL('../src/components/students/StudentAssignmentCard.tsx', import.meta.url), 'utf8');
const dashboardPage = readFileSync(new URL('../src/pages/StudentDashboardPage.tsx', import.meta.url), 'utf8');
const coursesPage = readFileSync(new URL('../src/pages/StudentCoursesPage.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const useStudentData = readFileSync(new URL('../src/hooks/useStudentData.ts', import.meta.url), 'utf8');
const schedulePage = readFileSync(new URL('../src/pages/StudentSchedulePage.tsx', import.meta.url), 'utf8');

test('student assignment cards close submission when portal is closed or past due', () => {
  assert.match(assignmentCard, /portalOpen === false/);
  assert.match(assignmentCard, /assignment\.isPastDue === true/);
});

test('student pages render useful empty states instead of blank sections', () => {
  assert.match(dashboardPage, /No pending assignments/);
  assert.match(coursesPage, /No Courses Assigned/);
});

test('student root route redirects to the dashboard', () => {
  assert.match(app, /path="\/student"/);
  assert.match(app, /to="\/student\/dashboard"/);
});

test('student data includes classes through batch roster membership', () => {
  assert.match(useStudentData, /\.from\('batches'\)/);
  assert.match(useStudentData, /\.in\('batch_id', batchIds\)/);
  assert.match(schedulePage, /\.from\('batches'\)/);
  assert.match(schedulePage, /\.in\('batch_id', batchIds\)/);
});

test('student course details avoid fake fields and use real available course data', () => {
  assert.match(coursesPage, /courseDetailRows/);
  assert.match(coursesPage, /No verified course details are available yet/);
  assert.doesNotMatch(coursesPage, /Credit Hours/);
  assert.doesNotMatch(coursesPage, /credit hours/);
  assert.doesNotMatch(useStudentData, /credits: 3/);
  assert.doesNotMatch(useStudentData, /See assigned class schedule/);
});
