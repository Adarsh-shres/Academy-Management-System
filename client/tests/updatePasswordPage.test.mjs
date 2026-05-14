import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const studentPage = readFileSync(new URL('../src/pages/UpdatePasswordPage.tsx', import.meta.url), 'utf8');
const teacherPage = readFileSync(new URL('../src/pages/TeacherUpdatePasswordPage.tsx', import.meta.url), 'utf8');

test('update password pages include accessible password visibility toggles', () => {
  for (const page of [studentPage, teacherPage]) {
    assert.match(page, /Eye, EyeOff/);
    assert.match(page, /showCurrentPassword/);
    assert.match(page, /showNewPassword/);
    assert.match(page, /showConfirmPassword/);
    assert.match(page, /type=\{visible \? 'text' : 'password'\}/);
    assert.match(page, /aria-label=\{visible \? ariaHideLabel : ariaShowLabel\}/);
    assert.match(page, /ariaShowLabel="Show current password"/);
    assert.match(page, /ariaHideLabel="Hide current password"/);
    assert.match(page, /ariaShowLabel="Show new password"/);
    assert.match(page, /ariaHideLabel="Hide new password"/);
    assert.match(page, /ariaShowLabel="Show confirm password"/);
    assert.match(page, /ariaHideLabel="Hide confirm password"/);
  }
});

test('update password pages use the refreshed password card styling', () => {
  for (const page of [studentPage, teacherPage]) {
    assert.match(page, /PasswordInput/);
    assert.match(page, /shadow-\[0_18px_50px_rgba\(57,31,86,0\.10\)\]/);
    assert.match(page, /Password checklist/);
  }
});
