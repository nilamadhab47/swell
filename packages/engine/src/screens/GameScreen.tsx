import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BlockStackGame } from '../games/blockStack/BlockStackGame';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { postCraving } from '../data/api';
import { cravingsQueryKey } from '../data/hooks/useCravings';
import { dashboardQueryKey } from '../data/hooks/useDashboard';
import { useFlowStore } from '../flow/useFlowStore';

export function GameScreen() {
  const config = useNicheConfig();
  const queryClient = useQueryClient();
  const session = useFlowStore((s) => s.session);
  const completeGame = useFlowStore((s) => s.completeGame);
  const setLastCravingId = useFlowStore((s) => s.setLastCravingId);

  const handleComplete = async (durationSecs: number) => {
    completeGame(durationSecs);

    if (config.useMockApi) {
      await queryClient.invalidateQueries({
        queryKey: dashboardQueryKey(config.appId),
      });
      return;
    }

    try {
      const created = await postCraving(config.appId, {
        beaten: true,
        game_played: session?.selectedGame ?? 'block_stack',
        duration_secs: durationSecs,
      });
      if (created.id) setLastCravingId(created.id);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKey(config.appId),
        }),
        queryClient.invalidateQueries({
          queryKey: cravingsQueryKey(config.appId),
        }),
      ]);
    } catch {
      // Offline-first: victory still shows even if API fails
    }
  };

  return (
    <BlockStackGame
      durationSecs={config.gameDurationSecs}
      onComplete={handleComplete}
    />
  );
}
