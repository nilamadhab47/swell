import { useQuery } from '@tanstack/react-query';
import { useNicheConfig } from '../../config/NicheConfigProvider';
import { useAuthStore } from '../../auth/useAuthStore';
import { useFlowStore } from '../../flow/useFlowStore';
import { getDashboard } from '../api';
import { buildMockDashboard } from '../mockDashboard';
import type { Dashboard } from '../types';

export const dashboardQueryKey = (appId: string) => ['dashboard', appId];

export function useDashboard() {
  const config = useNicheConfig();
  const localBeaten = useFlowStore((s) => s.cravingsBeatenThisWeek);
  const accessToken = useAuthStore((s) => s.accessToken);
  const live = !config.useMockApi;

  return useQuery({
    queryKey: dashboardQueryKey(config.appId),
    enabled: config.useMockApi || Boolean(accessToken),
    queryFn: async (): Promise<Dashboard> => {
      if (config.useMockApi) {
        return buildMockDashboard(config, localBeaten);
      }
      return getDashboard(config.appId);
    },
    placeholderData: live
      ? undefined
      : () => buildMockDashboard(config, localBeaten),
    staleTime: config.useMockApi ? Infinity : 30_000,
    retry: live ? 1 : 0,
  });
}

/** Convenience slice for Home hero metric. */
export function useCravingStats() {
  const config = useNicheConfig();
  const query = useDashboard();
  const localWins = useFlowStore((s) => s.cravingsBeatenThisWeek);

  const stats = query.data?.cravings;
  const baseline = config.mockSeed?.beatenThisWeek ?? 0;
  const fallbackWeek = baseline + localWins;
  const baselineTotal = config.mockSeed?.totalBeaten ?? 0;
  const fallbackTotal = baselineTotal + localWins;

  if (config.useMockApi) {
    return {
      ...query,
      beatenThisWeek: stats?.beaten_this_week ?? fallbackWeek,
      totalBeaten: stats?.total_beaten ?? fallbackTotal,
      totalSessions: stats?.total_sessions ?? fallbackTotal,
    };
  }

  return {
    ...query,
    beatenThisWeek: stats?.beaten_this_week ?? 0,
    totalBeaten: stats?.total_beaten ?? 0,
    totalSessions: stats?.total_sessions ?? 0,
  };
}
