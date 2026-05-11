import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getScheduleTeacherId } from '../src/lib/scheduleTeacherSelection.ts';

test('getScheduleTeacherId prefers the schedule row teacher over class defaults', () => {
  const teacherId = getScheduleTeacherId({ teacher_id: 'teacher-from-schedule' }, { teacher_id: 'teacher-from-class', teacher_ids: ['teacher-a'] });

  assert.equal(teacherId, 'teacher-from-schedule');
});

test('getScheduleTeacherId falls back to class primary teacher and teacher_ids', () => {
  assert.equal(getScheduleTeacherId({}, { teacher_id: 'teacher-from-class', teacher_ids: ['teacher-a'] }), 'teacher-from-class');
  assert.equal(getScheduleTeacherId({}, { teacher_ids: ['teacher-a'] }), 'teacher-a');
  assert.equal(getScheduleTeacherId({}, { teacher_ids: [] }), '');
});
