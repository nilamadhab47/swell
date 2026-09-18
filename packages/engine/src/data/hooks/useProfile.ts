import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/useAuthStore';
import { useNicheConfig } from '../../config/NicheConfigProvider';
import { getProfile } from '../api';
import type { Profile } from '../types';

export const profileQueryKey = (appId: string) => ['profile', appId];

export function useProfile() {
  const config = useNicheConfig();
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: profileQueryKey(config.appId),
    enabled: !config.useMockApi && Boolean(accessToken),
    queryFn: (): Promise<Profile> => getProfile(config.appId),
    staleTime: 60_000,
    retry: 1,
  });
}
