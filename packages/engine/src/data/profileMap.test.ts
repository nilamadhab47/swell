import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  answersToProfile,
  nameAgePatch,
  parseAgeInput,
  profileLooksOnboarded,
  profileToAnswers,
  resolveDisplayName,
  resolveFirstName,
} from './profileMap.ts';
import type { OnboardingAnswers } from '../onboarding/useOnboardingStore.ts';

const answers: OnboardingAnswers = {
  name: 'Maya',
  age: '29',
  habit: 'cigarettes',
  reason: 'My kids are watching',
  cigs_per_day: '10',
  cost_per_pack: '180',
  quit_date: '2026-09-01',
};

test('answersToProfile keeps age and extras needed for the craving loop', () => {
  const payload = answersToProfile(answers);
  assert.equal(payload.name, 'Maya');
  assert.equal(payload.age, 29);
  assert.equal(payload.quitReason, 'My kids are watching');
  assert.equal(payload.extras?.onboardingCompleted, true);
  assert.equal(payload.extras?.habit, 'cigarettes');
  assert.equal(payload.extras?.cigs_per_day, 10);
  assert.equal(payload.extras?.cost_per_pack, 180);
  assert.equal(payload.extras?.quit_date, '2026-09-01');
});

test('nameAgePatch updates name/age without wiping habit extras', () => {
  const patch = nameAgePatch(
    {
      name: 'Maya',
      age: 29,
      extras: {
        onboardingCompleted: true,
        habit: 'cigarettes',
        cigs_per_day: 10,
        quit_date: '2026-09-01',
      },
    },
    '  Nila  ',
    31,
  );
  assert.equal(patch.name, 'Nila');
  assert.equal(patch.age, 31);
  assert.equal(patch.extras?.habit, 'cigarettes');
  assert.equal(patch.extras?.cigs_per_day, 10);
  assert.equal(patch.extras?.onboardingCompleted, true);
  assert.equal(patch.extras?.quit_date, '2026-09-01');
  assert.equal(patch.extras?.name, 'Nila');
});

test('nameAgePatch without a loaded profile keeps extras from onboarding answers', () => {
  const patch = nameAgePatch(undefined, 'Nila', 31, answers);
  assert.equal(patch.name, 'Nila');
  assert.equal(patch.extras?.habit, 'cigarettes');
  assert.equal(patch.extras?.cigs_per_day, 10);
  assert.equal(patch.extras?.onboardingCompleted, true);
  assert.equal(patch.extras?.quit_date, '2026-09-01');
});

test('nameAgePatch with no profile and no answers omits extras so PATCH cannot wipe them', () => {
  const patch = nameAgePatch(undefined, 'Nila', 31);
  assert.equal(patch.name, 'Nila');
  assert.equal(patch.age, 31);
  assert.equal(patch.extras, undefined);
});

test('profileToAnswers reads name and age from extras when top-level fields are missing', () => {
  const mapped = profileToAnswers({
    extras: { name: 'Maya', age: 29, habit: 'cigarettes' },
  });
  assert.equal(mapped.name, 'Maya');
  assert.equal(mapped.age, '29');
  assert.equal(mapped.habit, 'cigarettes');
});

test('profileToAnswers round-trips name and age for Settings', () => {
  const mapped = profileToAnswers({
    name: 'Maya',
    age: 29,
    quitReason: 'My kids are watching',
    extras: { habit: 'cigarettes', cigs_per_day: 10 },
  });
  assert.equal(mapped.name, 'Maya');
  assert.equal(mapped.age, '29');
  assert.equal(mapped.habit, 'cigarettes');
  assert.equal(mapped.reason, 'My kids are watching');
});

test('onboarding stay-complete if extras flag or quit reason exists', () => {
  assert.equal(
    profileLooksOnboarded({ extras: { onboardingCompleted: true } }),
    true,
  );
  assert.equal(profileLooksOnboarded({ quitReason: 'Kids' }), true);
  assert.equal(profileLooksOnboarded({}), false);
});

test('resolveFirstName falls back through extras and auth, and greets without a name', () => {
  assert.equal(resolveFirstName('', { extras: { name: 'Maya Singh' } }), 'Maya');
  assert.equal(resolveFirstName('  ', null, 'Dev'), 'Dev');
  assert.equal(resolveFirstName('  Maya  '), 'Maya');
  assert.equal(resolveDisplayName('   '), '');
  assert.equal(resolveFirstName(''), '');
});

test('parseAgeInput allows blank, rejects junk and out-of-range', () => {
  assert.deepEqual(parseAgeInput(''), { ok: true, age: undefined });
  assert.deepEqual(parseAgeInput('  '), { ok: true, age: undefined });
  assert.deepEqual(parseAgeInput('29'), { ok: true, age: 29 });
  assert.equal(parseAgeInput('12').ok, false);
  assert.equal(parseAgeInput('121').ok, false);
  assert.equal(parseAgeInput('abc').ok, false);
  assert.equal(parseAgeInput('29.5').ok, false);
});
