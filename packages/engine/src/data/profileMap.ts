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

export function profileToAnswers(profile: Profile): OnboardingAnswers {
  const extras = profile.extras;
  return {
    habit: extrasString(extras, 'habit'),
    reason: profile.quitReason ?? extrasString(extras, 'reason') ?? '',
    cigs_per_day: extrasString(extras, 'cigs_per_day'),
    cost_per_pack: extrasString(extras, 'cost_per_pack'),
    quit_date: extrasString(extras, 'quit_date') || null,
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

  return {
    quitReason: answers.reason.trim() || undefined,
    daysSmokeFree,
    extras: {
      onboardingCompleted: true,
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
