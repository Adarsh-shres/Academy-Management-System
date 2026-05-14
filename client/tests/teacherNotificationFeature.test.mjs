import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const notificationsSource = readFileSync(new URL('../src/lib/notifications.ts', import.meta.url), 'utf8');
const schedulePageSource = readFileSync(new URL('../src/pages/ScheduleClassDetailPage.tsx', import.meta.url), 'utf8');

test('frontend supports teacher deadline and schedule notification types', () => {
  assert.match(notificationsSource, /'deadline'/);
  assert.match(notificationsSource, /'schedule'/);
  assert.match(notificationsSource, /sendNotificationToUsers/);
});

test('admin schedule edits notify affected teachers', () => {
  assert.match(schedulePageSource, /sendNotificationToUsers/);
  assert.match(schedulePageSource, /notifyTeachersOfScheduleChange/);
  assert.match(schedulePageSource, /type:\s*'schedule'/);
  assert.match(schedulePageSource, /saveWeeklySchedule[\s\S]*notifyTeachersOfScheduleChange/);
  assert.match(schedulePageSource, /saveTodayOverride[\s\S]*notifyTeachersOfScheduleChange/);
  assert.match(schedulePageSource, /clearTodayOverride[\s\S]*notifyTeachersOfScheduleChange/);
  assert.match(schedulePageSource, /removeScheduleEntry[\s\S]*notifyTeachersOfScheduleChange/);
});
