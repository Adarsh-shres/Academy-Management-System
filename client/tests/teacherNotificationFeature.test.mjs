import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const notificationsSource = readFileSync(new URL('../src/lib/notifications.ts', import.meta.url), 'utf8');
const schedulePageSource = readFileSync(new URL('../src/pages/ScheduleClassDetailPage.tsx', import.meta.url), 'utf8');
const notificationFixSql = readFileSync(new URL('../../supabase/fix_notifications_and_student_provisioning.sql', import.meta.url), 'utf8');

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

test('Supabase script creates automatic deadline notification function', () => {
  assert.match(notificationFixSql, /deadline_notified_at/);
  assert.match(notificationFixSql, /create or replace function public\.create_due_deadline_teacher_notifications/);
  assert.match(notificationFixSql, /from public\.assignments/);
  assert.match(notificationFixSql, /from public\.quizzes/);
  assert.match(notificationFixSql, /type in \('announcement', 'content', 'update', 'assignment_open', 'manual', 'deadline', 'schedule'\)/);
});
