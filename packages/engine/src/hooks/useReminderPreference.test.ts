import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRemindersEnabled } from './reminders.ts';

test('reminders default on when nothing is stored', () => {
  assert.equal(parseRemindersEnabled(null), true);
  assert.equal(parseRemindersEnabled(undefined), true);
  assert.equal(parseRemindersEnabled('1'), true);
});

test('only an explicit 0 turns reminders off', () => {
  assert.equal(parseRemindersEnabled('0'), false);
});

test('unknown stored values fail open (stay on)', () => {
  assert.equal(parseRemindersEnabled('false'), true);
  assert.equal(parseRemindersEnabled('off'), true);
});
