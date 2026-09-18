import type {
  AuthTokens,
  AuthUser,
  CravingList,
  CravingRecord,
  Dashboard,
  DerivedStats,
  HealthTimelineItem,
  HealthTimelineStatus,
  Profile,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function str(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function extractAuthTokens(data: unknown): AuthTokens {
  const root = isRecord(data) ? data : {};
  const nested = isRecord(root.tokens)
    ? root.tokens
    : isRecord(root.session)
      ? root.session
      : root;
  const accessToken =
    str(nested.accessToken) ??
    str(nested.access_token) ??
    str(nested.token) ??
    str(root.accessToken) ??
    str(root.access_token) ??
    '';
  const refreshToken =
    str(nested.refreshToken) ??
    str(nested.refresh_token) ??
    str(root.refreshToken) ??
    str(root.refresh_token) ??
    '';
  const userRaw = isRecord(root.user)
    ? root.user
    : isRecord(nested.user)
      ? nested.user
      : null;
  const user: AuthUser | null = userRaw
    ? {
        id: str(userRaw.id) ?? str(userRaw.userId) ?? '',
        email: str(userRaw.email),
        phone: str(userRaw.phone),
        name: str(userRaw.name),
      }
    : null;

  return { accessToken, refreshToken, user };
}

export function extractId(data: unknown): string {
  if (typeof data === 'string') return data;
  const root = isRecord(data) ? data : {};
  return (
    str(root.id) ??
    str(root.cravingId) ??
    str(root.craving_id) ??
    ''
  );
}

function timelineStatus(value: unknown): HealthTimelineStatus {
  if (value === 'completed' || value === 'current' || value === 'upcoming') {
    return value;
  }
  return 'upcoming';
}

export function normalizeDashboard(raw: unknown): Dashboard {
  const root = isRecord(raw) ? raw : {};
  const cravings = isRecord(root.cravings) ? root.cravings : root;
  const derivedRaw = isRecord(root.derived) ? root.derived : root;
  const pulse = isRecord(root.community_pulse)
    ? root.community_pulse
    : isRecord(root.communityPulse)
      ? root.communityPulse
      : null;

  const derived: DerivedStats = {
    days_smoke_free: num(
      derivedRaw.days_smoke_free ?? derivedRaw.daysSmokeFree
    ),
    money_reclaimed: num(
      derivedRaw.money_reclaimed ?? derivedRaw.moneyReclaimed
    ),
    money_currency: str(derivedRaw.money_currency ?? derivedRaw.moneyCurrency) ?? 'INR',
    time_saved_minutes: num(
      derivedRaw.time_saved_minutes ?? derivedRaw.timeSavedMinutes
    ),
  };

  const timelineRaw = root.health_timeline ?? root.healthTimeline;
  const health_timeline: HealthTimelineItem[] = Array.isArray(timelineRaw)
    ? timelineRaw.map((item, index) => {
        const row = isRecord(item) ? item : {};
        return {
          id: str(row.id) ?? `item-${index}`,
          label: str(row.label) ?? '',
          description: str(row.description),
          status: timelineStatus(row.status),
          completed_at:
            str(row.completed_at ?? row.completedAt) ?? null,
        };
      })
    : [];

  return {
    cravings: {
      total_beaten: num(cravings.total_beaten ?? cravings.totalBeaten),
      beaten_this_week: num(
        cravings.beaten_this_week ?? cravings.beatenThisWeek
      ),
      total_sessions: num(
        cravings.total_sessions ?? cravings.totalSessions
      ),
    },
    derived,
    health_timeline,
    community_pulse: pulse
      ? {
          beaten_today: num(pulse.beaten_today ?? pulse.beatenToday),
        }
      : undefined,
    longest_streak_days: (() => {
      const value = num(root.longest_streak_days ?? root.longestStreakDays, NaN);
      return Number.isFinite(value) ? value : undefined;
    })(),
  };
}

export function normalizeProfile(raw: unknown): Profile {
  const root = isRecord(raw) ? raw : {};
  const extras = isRecord(root.extras) ? root.extras : undefined;
  return {
    name: str(root.name),
    quitReason: str(root.quitReason ?? root.quit_reason),
    daysSmokeFree: (() => {
      const value = num(root.daysSmokeFree ?? root.days_smoke_free, NaN);
      return Number.isFinite(value) ? value : undefined;
    })(),
    timeSavedMinutes: (() => {
      const value = num(root.timeSavedMinutes ?? root.time_saved_minutes, NaN);
      return Number.isFinite(value) ? value : undefined;
    })(),
    moneySaved: (() => {
      const value = num(root.moneySaved ?? root.money_saved, NaN);
      return Number.isFinite(value) ? value : undefined;
    })(),
    smokingDuration: str(root.smokingDuration ?? root.smoking_duration),
    age: (() => {
      const value = num(root.age, NaN);
      return Number.isFinite(value) ? value : undefined;
    })(),
    gender: str(root.gender),
    extras,
  };
}

export function normalizeCravingList(raw: unknown): CravingList {
  const root = isRecord(raw) ? raw : {};
  const rows = Array.isArray(root.items)
    ? root.items
    : Array.isArray(raw)
      ? raw
      : [];
  const items: CravingRecord[] = rows.map((item) => {
    const row = isRecord(item) ? item : {};
    return {
      id: str(row.id) ?? '',
      beaten: row.beaten === true,
      game_played: str(row.game_played ?? row.gamePlayed) ?? null,
      duration_secs: (() => {
        const value = num(row.duration_secs ?? row.durationSecs, NaN);
        return Number.isFinite(value) ? value : null;
      })(),
      trigger_note: str(row.trigger_note ?? row.triggerNote) ?? null,
      voice_note_key: str(row.voice_note_key ?? row.voiceNoteKey) ?? null,
      transcript: str(row.transcript) ?? null,
      created_at:
        str(row.created_at ?? row.createdAt) ?? new Date(0).toISOString(),
    };
  });
  return {
    items,
    total: num(root.total, items.length),
  };
}
