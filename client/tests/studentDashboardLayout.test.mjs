import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const dashboardPage = readFileSync(new URL('../src/pages/StudentDashboardPage.tsx', import.meta.url), 'utf8');

test('student dashboard does not show the recent activity section', () => {
  assert.doesNotMatch(dashboardPage, /Recent Activity/);
  assert.doesNotMatch(dashboardPage, /No recent activity yet/);
});

test('student dashboard shows a grade score calculated from completed and partial results', () => {
  assert.match(dashboardPage, /completedGradeCount/);
  assert.match(dashboardPage, /partialGradeCount/);
  assert.match(dashboardPage, /\(completedGradeCount \* 100 \+ partialGradeCount \* 50\)/);
  assert.match(dashboardPage, /label="Grade Score"/);
});
