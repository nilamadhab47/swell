import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homeGreeting } from './greeting.ts';

function atHour(hour: number): Date {
  return new Date(2026, 9, 1, hour, 0, 0);
}

test('morning without a name', () => {
  assert.equal(homeGreeting(undefined, atHour(8)), 'Good morning.');
  assert.equal(homeGreeting('  ', atHour(0)), 'Good morning.');
});

test('afternoon and evening with a first name', () => {
  assert.equal(homeGreeting('Nila', atHour(12)), 'Good afternoon, Nila.');
  assert.equal(homeGreeting('Nila', atHour(16)), 'Good afternoon, Nila.');
  assert.equal(homeGreeting('Nila', atHour(17)), 'Good evening, Nila.');
  assert.equal(homeGreeting('Nila', atHour(23)), 'Good evening, Nila.');
});

test('trims whitespace so Home never greets a blank name', () => {
  assert.equal(homeGreeting('  Maya  ', atHour(9)), 'Good morning, Maya.');
});
