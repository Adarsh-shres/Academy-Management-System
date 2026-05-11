import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const notificationsSource = readFileSync(new URL('../src/lib/notifications.ts', import.meta.url), 'utf8');
const notificationFixSql = readFileSync(new URL('../../supabase/fix_notifications_and_student_provisioning.sql', import.meta.url), 'utf8');

function extractNotificationTypes(source) {
  const match = source.match(/export type NotificationType = ([^;]+);/);
  assert.ok(match, 'NotificationType union should exist');

  return [...match[1].matchAll(/'([^']+)'/g)].map(([, value]) => value);
}

test('notifications constraint fix allows every frontend notification type', () => {
  const frontendTypes = extractNotificationTypes(notificationsSource);

  assert.match(notificationFixSql, /drop constraint if exists notifications_type_check/i);
  assert.match(notificationFixSql, /add constraint notifications_type_check/i);

  for (const type of frontendTypes) {
    assert.match(notificationFixSql, new RegExp(`'${type}'`));
  }
});
