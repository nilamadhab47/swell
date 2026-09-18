export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
  error?: {
    code: string;
  };
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
}

export interface CravingPayload {
  beaten: boolean;
  game_played: string;
  duration_secs: number;
  trigger_note?: string;
  voice_note_key?: string;
  transcript?: string;
}

export interface CravingStats {
  total_beaten: number;
  beaten_this_week: number;
  total_sessions: number;
}

export interface DerivedStats {
  days_smoke_free: number;
  money_reclaimed: number;
  money_currency: string;
  time_saved_minutes: number;
}

export type HealthTimelineStatus = 'completed' | 'current' | 'upcoming';

export interface HealthTimelineItem {
  id: string;
  label: string;
  description?: string;
  status: HealthTimelineStatus;
  completed_at: string | null;
}

export interface CommunityPulse {
  beaten_today: number;
}

export interface Dashboard {
  cravings: CravingStats;
  derived: DerivedStats;
  health_timeline: HealthTimelineItem[];
  community_pulse?: CommunityPulse;
  longest_streak_days?: number;
}

export interface CravingRecord {
  id: string;
  beaten: boolean;
  game_played?: string | null;
  duration_secs?: number | null;
  trigger_note?: string | null;
  voice_note_key?: string | null;
  transcript?: string | null;
  created_at: string;
}

export interface CravingList {
  items: CravingRecord[];
  total: number;
}

export interface Profile {
  name?: string;
  quitReason?: string;
  daysSmokeFree?: number;
  timeSavedMinutes?: number;
  moneySaved?: number;
  smokingDuration?: string;
  age?: number;
  gender?: string;
  extras?: Record<string, unknown>;
}

export interface ProfileUpdate {
  name?: string;
  quitReason?: string;
  daysSmokeFree?: number;
  timeSavedMinutes?: number;
  moneySaved?: number;
  extras?: Record<string, unknown>;
}
