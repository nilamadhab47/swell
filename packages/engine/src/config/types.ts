export interface OnboardingQuestion {
  id: string;
  prompt: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
  metaKey?: string;
}

export interface Milestone {
  id: string;
  label: string;
  description: string;
  durationMinutes: number;
}

/**
 * Ads + IAP. Keep `enabled: false` until there are enough users.
 * Fight, Victory, and Reflect stay free regardless.
 */
export interface MonetizationConfig {
  enabled: boolean;
  ads: boolean;
  purchases: boolean;
}

export interface NicheConfig {
  appId: string;
  brand: {
    name: string;
    tagline: string;
    iconRef: string;
  };
  heroMetricLabel: string;
  primaryActionLabel: string;
  onboarding: OnboardingQuestion[];
  economics?: {
    unitCostPrompt: string;
    unitsPerDayPrompt: string;
  };
  aiReflectionSystemPrompt: string;
  healthTimeline: Milestone[];
  motivationQuotes: string[];
  socialProofMessage: string;
  /** Parked until we have real volume. Default off = no ads, no paywall. */
  monetization?: MonetizationConfig;
  /** When true, all data comes from local mocks — no network calls. */
  useMockApi: boolean;
  /** Baseline demo stats for UI development (merged with live session wins). */
  mockSeed?: {
    daysSmokeFree: number;
    moneyReclaimed: number;
    beatenThisWeek: number;
    totalBeaten: number;
    communityBeatenToday: number;
    longestStreakDays: number;
  };
  apiBaseUrl: string;
  gameDurationSecs: number;
}
