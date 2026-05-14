import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const assignmentCard = readFileSync(new URL('../src/components/students/StudentAssignmentCard.tsx', import.meta.url), 'utf8');
const useStudentData = readFileSync(new URL('../src/hooks/useStudentData.ts', import.meta.url), 'utf8');
const submissionPageUrl = new URL('../src/pages/StudentAssignmentSubmissionPage.tsx', import.meta.url);

test('student assignments link to a dedicated submission history page', () => {
  assert.match(app, /StudentAssignmentSubmissionPage/);
  assert.match(app, /path="\/student\/assignments\/:assignmentId\/submissions"/);
  assert.match(assignmentCard, /\/student\/assignments\/\$\{assignment\.id\}\/submissions/);
});

test('student assignment cards show outcome status instead of duplicate marks awarded', () => {
  assert.doesNotMatch(assignmentCard, /Marks Awarded/);
  assert.doesNotMatch(assignmentCard, /\{marks\}/);
  assert.match(assignmentCard, /gradeStatusLabel/);
});

test('student data keeps submission feedback and attempt history', () => {
  assert.match(useStudentData, /feedback/);
  assert.match(useStudentData, /submissionHistory/);
  assert.match(useStudentData, /status !== 'pending'/);
});

test('student submission page shows remarks, history, and resubmission affordance', () => {
  assert.equal(existsSync(submissionPageUrl), true);

  const submissionPage = readFileSync(submissionPageUrl, 'utf8');
  assert.match(submissionPage, /\.from\('submissions'\)/);
  assert.match(submissionPage, /Teacher Remarks/);
  assert.match(submissionPage, /Submission History/);
  assert.match(submissionPage, /Resubmit Assignment/);
  assert.match(submissionPage, /SubmitAssignmentModal/);
});
