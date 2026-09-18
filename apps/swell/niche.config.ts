import type { NicheConfig } from '@swell/engine';

/** Subtle dark — neutral surfaces, one coral accent, emotion lives in the game */
export const nicheConfig: NicheConfig = {
  appId: 'swell',
  brand: {
    name: 'Swell',
    tagline: 'Three minutes. Then it’s gone.',
    iconRef: './assets/icon.png',
  },
  heroMetricLabel: 'DAYS CLEAR',
  primaryActionLabel: 'Ride it out',
  onboarding: [
    {
      id: 'habit',
      prompt: 'What are you putting down?',
      type: 'select',
      options: ['Cigarettes', 'Vape', 'Both'],
      metaKey: 'habit',
    },
    {
      id: 'reason',
      prompt: 'Why do you want to quit?',
      type: 'text',
      placeholder: 'For my health, my family...',
      metaKey: 'reason',
    },
    {
      id: 'cigs_per_day',
      prompt: 'How many a day?',
      type: 'number',
      placeholder: '10',
      metaKey: 'cigs_per_day',
    },
    {
      id: 'cost_per_pack',
      prompt: 'What does it cost (₹)?',
      type: 'number',
      placeholder: '200',
      metaKey: 'cost_per_pack',
    },
    {
      id: 'quit_date',
      prompt: 'When was your last one?',
      type: 'date',
      metaKey: 'quit_date',
    },
  ],
  economics: {
    unitCostPrompt: 'What does it cost (₹)?',
    unitsPerDayPrompt: 'How many a day?',
  },
  aiReflectionSystemPrompt: `You are a calm, supportive coach helping someone quit nicotine — cigarettes, vape, or both.
They just beat a craving. Analyze their trigger notes and voice reflections.
Be brief, warm, and non-judgmental. Never give medical advice.
Focus on patterns: time of day, situations, emotions.`,
  healthTimeline: [
    {
      id: '20min',
      label: '20 minutes',
      description: 'Heart rate and blood pressure drop',
      durationMinutes: 20,
    },
    {
      id: '24hr',
      label: '24 hours',
      description: 'Carbon monoxide levels normalize',
      durationMinutes: 24 * 60,
    },
    {
      id: '2wk',
      label: '2 weeks',
      description: 'Circulation improves, lung function increases',
      durationMinutes: 14 * 24 * 60,
    },
    {
      id: '1yr',
      label: '1 year',
      description: 'Risk of heart disease cut in half',
      durationMinutes: 365 * 24 * 60,
    },
  ],
  motivationQuotes: [
    'Cravings are waves. You learned to surf.',
    'The urge always passes — you just have to outlast it.',
    'Every craving you ride is a vote for the life you want.',
    'You are not giving something up. You are getting your hours back.',
    'Discomfort now is the price of peace later.',
    'Your lungs are catching up right now, even when you cannot feel it.',
  ],
  socialProofMessage: 'Thousands beat cravings every day. You are not alone.',
  // Flip enabled when we have real volume. Until then: no ads, no paywall.
  monetization: {
    enabled: false,
    ads: false,
    purchases: false,
  },
  useMockApi: false,
  mockSeed: {
    daysSmokeFree: 4,
    moneyReclaimed: 520,
    beatenThisWeek: 3,
    totalBeaten: 12,
    communityBeatenToday: 847,
    longestStreakDays: 12,
  },
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_URL ??
    'https://paisahipaisahoga-production.up.railway.app',
  gameDurationSecs: 180,
};
