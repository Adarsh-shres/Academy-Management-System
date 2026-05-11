import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getScheduleCourseId } from '../src/lib/scheduleCourseSelection.ts';

test('getScheduleCourseId prefers the schedule row course over the class default', () => {
  const courseId = getScheduleCourseId({ course_id: 'course-from-schedule' }, { course_id: 'course-from-class' });

  assert.equal(courseId, 'course-from-schedule');
});

test('getScheduleCourseId falls back to the class course and then first batch course', () => {
  assert.equal(getScheduleCourseId({}, { course_id: 'course-from-class', batchCourseIds: ['first-batch-course'] }), 'course-from-class');
  assert.equal(getScheduleCourseId({}, { batchCourseIds: ['first-batch-course'] }), 'first-batch-course');
  assert.equal(getScheduleCourseId({}, { batchCourseIds: [] }), '');
});
