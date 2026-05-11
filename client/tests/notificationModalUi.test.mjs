import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../src/pages/NotificationsPage.tsx', import.meta.url), 'utf8');

test('notification detail modal uses a light overlay and compact message area', () => {
  assert.doesNotMatch(source, /bg-\[#391f56\]\/80/);
  assert.doesNotMatch(source, /min-h-\[100px\]/);
  assert.match(source, /bg-\[rgba\(15,23,42,0\.18\)\]/);
  assert.match(source, /max-w-\[520px\]/);
});
