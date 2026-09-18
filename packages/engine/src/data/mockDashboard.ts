import type { Dashboard, HealthTimelineItem } from './types';
import type { Milestone, NicheConfig } from '../config/types';

function buildHealthTimeline(
  milestones: Milestone[],
  daysSmokeFree: number
): HealthTimelineItem[] {
  const minutesSmokeFree = daysSmokeFree * 24 * 60;
  let foundCurrent = false;

  return milestones.map((m) => {
    if (minutesSmokeFree >= m.durationMinutes) {
      return {
        id: m.id,
        label: m.label,
        description: m.description,
        status: 'completed' as const,
        completed_at: null,
      };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return {
        id: m.id,
        label: m.label,
        description: m.description,
        status: 'current' as const,
        completed_at: null,
      };
    }
    return {
      id: m.id,
      label: m.label,
      description: m.description,
      status: 'upcoming' as const,
      completed_at: null,
    };
  });
}

/** Local-only dashboard for UI development. Merges mock seed + session wins. */
export function buildMockDashboard(
  config: NicheConfig,
  sessionWinsThisWeek: number
): Dashboard {
  const seed = config.mockSeed;
  const baselineWeek = seed?.beatenThisWeek ?? 0;
  const baselineTotal = seed?.totalBeaten ?? 0;
  const beatenThisWeek = baselineWeek + sessionWinsThisWeek;
  const totalBeaten = baselineTotal + sessionWinsThisWeek;
  const daysSmokeFree = seed?.daysSmokeFree ?? 0;
  const moneyReclaimed = seed?.moneyReclaimed ?? 0;
  const timeSavedMinutes =
    (seed?.beatenThisWeek ?? 0) * 5 + sessionWinsThisWeek * 5;

  return {
    cravings: {
      total_beaten: totalBeaten,
      beaten_this_week: beatenThisWeek,
      total_sessions: totalBeaten,
    },
    derived: {
      days_smoke_free: daysSmokeFree,
      money_reclaimed: moneyReclaimed,
      money_currency: 'INR',
      time_saved_minutes: timeSavedMinutes,
    },
    health_timeline: buildHealthTimeline(config.healthTimeline, daysSmokeFree),
    community_pulse: {
      beaten_today: seed?.communityBeatenToday ?? 0,
    },
    longest_streak_days: seed?.longestStreakDays,
  };
}
