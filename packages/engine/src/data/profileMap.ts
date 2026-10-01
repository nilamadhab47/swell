import type { OnboardingAnswers } from '../onboarding/useOnboardingStore';
import type { Profile, ProfileUpdate } from './types';

export function extrasString(extras: Record<string, unknown> | undefined, key: string): string {
  const value = extras?.[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

export function extrasBool(extras: Record<string, unknown> | undefined, key: string): boolean {
  return extras?.[key] === true;
}

/** Name for Settings / greeting. Local answers win, then profile, extras, auth. */
export function resolveDisplayName(
  answersName?: string,
  profile?: Profile | null,
  authName?: string,
): string {
  const extra = extrasString(profile?.extras, 'name');
  return (
    answersName?.trim() ||
    profile?.name?.trim() ||
    extra.trim() ||
    authName?.trim() ||
    ''
  );
}

export function resolveFirstName(
  answersName?: string,
  profile?: Profile | null,
  authName?: string,
): string {
  return resolveDisplayName(answersName, profile, authName).split(/\s+/)[0] || '';
}

/** Empty is allowed (age optional). Junk / out-of-range is not. */
export function parseAgeInput(raw: string): { ok: true; age?: number } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, age: undefined };
  if (!/^\d{1,3}$/.test(trimmed)) return { ok: false };
  const age = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(age) || age < 13 || age > 120) return { ok: false };
  return { ok: true, age };
}

export function profileToAnswers(profile: Profile): OnboardingAnswers {
  const extras = profile.extras;
  return {
    name: profile.name ?? extrasString(extras, 'name') ?? '',
    age: profile.age != null ? String(profile.age) : extrasString(extras, 'age'),
    habit: extrasString(extras, 'habit'),
    reason: profile.quitReason ?? extrasString(extras, 'reason') ?? '',
    cigs_per_day: extrasString(extras, 'cigs_per_day'),
    cost_per_pack: extrasString(extras, 'cost_per_pack'),
    quit_date: extrasString(extras, 'quit_date') || null,
  };
}

/**
 * Name/age PATCH that keeps habit extras intact.
 * If the profile query has not loaded, fall back to onboarding answers.
 * If neither has extras, omit the extras key so a replace-on-PATCH backend
 * cannot wipe quit date / cigs.
 */
export function nameAgePatch(
  current: Profile | undefined,
  name: string,
  age?: number,
  answers?: OnboardingAnswers,
): ProfileUpdate {
  const trimmed = name.trim();
  const fromAnswers = answers ? answersToProfile(answers).extras : undefined;
  const merged = {
    ...(fromAnswers ?? {}),
    ...(current?.extras ?? {}),
  };
  const hasExtras = Object.keys(merged).length > 0;
  return {
    name: trimmed || undefined,
    age,
    ...(hasExtras
      ? {
          extras: {
            ...merged,
            name: trimmed || undefined,
            age,
          },
        }
      : {}),
  };
}

export function answersToProfile(answers: OnboardingAnswers): ProfileUpdate {
  const cigs = Number(answers.cigs_per_day);
  const cost = Number(answers.cost_per_pack);
  const quit = answers.quit_date ? new Date(answers.quit_date) : null;
  const daysSmokeFree =
    quit && !Number.isNaN(quit.getTime())
      ? Math.max(0, Math.floor((Date.now() - quit.getTime()) / 86_400_000))
      : undefined;
  const age = Number(answers.age);

  return {
    name: answers.name.trim() || undefined,
    age: Number.isFinite(age) && age > 0 ? age : undefined,
    quitReason: answers.reason.trim() || undefined,
    daysSmokeFree,
    extras: {
      onboardingCompleted: true,
      name: answers.name.trim() || undefined,
      age: Number.isFinite(age) && age > 0 ? age : undefined,
      habit: answers.habit || undefined,
      cigs_per_day: Number.isFinite(cigs) ? cigs : undefined,
      cost_per_pack: Number.isFinite(cost) ? cost : undefined,
      cigs_per_pack: 20,
      quit_date: answers.quit_date,
    },
  };
}

export function profileLooksOnboarded(profile: Profile): boolean {
  return (
    extrasBool(profile.extras, 'onboardingCompleted') ||
    Boolean(profile.quitReason?.trim()) ||
    Boolean(extrasString(profile.extras, 'quit_date'))
  );
}
