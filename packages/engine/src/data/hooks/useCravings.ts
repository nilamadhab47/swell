import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/useAuthStore';
import { useNicheConfig } from '../../config/NicheConfigProvider';
import { getCravings } from '../api';
import type { CravingList, CravingRecord } from '../types';

export const cravingsQueryKey = (appId: string) => ['cravings', appId];

export function useCravings(opts?: { limit?: number }) {
  const config = useNicheConfig();
  const accessToken = useAuthStore((s) => s.accessToken);
  const live = !config.useMockApi;

  return useQuery({
    queryKey: [...cravingsQueryKey(config.appId), opts?.limit ?? 20],
    enabled: live && Boolean(accessToken),
    queryFn: (): Promise<CravingList> =>
      getCravings(config.appId, { limit: opts?.limit ?? 20 }),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useLatestNote(): CravingRecord | null {
  const query = useCravings({ limit: 20 });
  const items = query.data?.items ?? [];
  return (
    items.find((item) => Boolean(item.trigger_note || item.transcript)) ?? null
  );
}
