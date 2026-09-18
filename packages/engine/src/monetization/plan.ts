/**
 * Locked money plan — dormant until NicheConfig.monetization.enabled is true.
 *
 * Ladder: ₹149 lifetime Plus → rewarded ads on free tier → subscription only
 * if weekly insights stick. Store billing via RevenueCat, never Razorpay in-app.
 *
 * Sacred: never ads during Fight or over the Victory beat.
 * Interstitial only after they leave Victory (Not now / after Reflect).
 * No banners on Home or Reflect.
 */
export const SWELL_PLUS = {
  productId: 'swell_plus_lifetime',
  priceInr: 149,
  includes: [
    'remove_ads',
    'all_games',
    'ongoing_weekly_insights',
    'custom_reminders',
  ] as const,
} as const;

export const FIRST_WEEKLY_INSIGHT_FREE = true;

export const PAYWALL_AFTER_WINS = 5;

export type AdPlacement =
  | 'post_victory_leave'
  | 'rewarded_extra_game'
  | 'rewarded_skin'
  | 'rewarded_insight';

export const AD_RULES: Record<
  AdPlacement,
  { allowedWhenLive: boolean; note: string }
> = {
  post_victory_leave: {
    allowedWhenLive: true,
    note: 'Interstitial after they leave Victory — never over the why line.',
  },
  rewarded_extra_game: {
    allowedWhenLive: true,
    note: 'Opt-in only. Never required to finish a craving.',
  },
  rewarded_skin: {
    allowedWhenLive: true,
    note: 'Opt-in cosmetic. Play tab, not Fight.',
  },
  rewarded_insight: {
    allowedWhenLive: true,
    note: 'Opt-in extra insight after the first free weekly one.',
  },
};
