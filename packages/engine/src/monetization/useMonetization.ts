import { useNicheConfig } from '../config/NicheConfigProvider';
import { AD_RULES, type AdPlacement } from './plan';

function isLive(enabled: boolean | undefined): boolean {
  return enabled === true;
}

/**
 * Single gate for ads and pay. While the master switch is off, everything
 * is free and these functions are no-ops. Flip `monetization.enabled` in
 * niche.config when volume is real — then wire AdMob + RevenueCat here.
 */
export function useMonetization() {
  const { monetization } = useNicheConfig();
  const live = isLive(monetization?.enabled);
  const ads = live && monetization?.ads === true;
  const purchases = live && monetization?.purchases === true;

  return {
    live,
    ads,
    purchases,
    /** While dormant, treat everyone as Plus so nothing is gated. */
    isPlus: !purchases,
    canShowAd: (placement: AdPlacement) =>
      ads && AD_RULES[placement].allowedWhenLive,
  };
}

/** Post-Victory interstitial hook. No-op until ads are live. */
export async function maybeShowPostVictoryAd(adsLive: boolean): Promise<void> {
  if (!adsLive) return;
  // TODO: AdMob interstitial after they leave Victory (not over the beat).
}

/** Lifetime Plus paywall. No-op until purchases are live. */
export async function presentPlusPaywall(purchasesLive: boolean): Promise<void> {
  if (!purchasesLive) return;
  // TODO: RevenueCat purchase for SWELL_PLUS.productId
}
