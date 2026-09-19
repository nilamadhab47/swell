import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BlockStackGame } from '../games/blockStack/BlockStackGame';
import { ScribbleGame } from '../games/scribble/ScribbleGame';
import { FlappyGame } from '../games/flappy/FlappyGame';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { postCraving } from '../data/api';
import { cravingsQueryKey } from '../data/hooks/useCravings';
import { dashboardQueryKey } from '../data/hooks/useDashboard';
import { useFlowStore } from '../flow/useFlowStore';
import { useOnboardingStore } from '../onboarding/useOnboardingStore';
import { useProfile } from '../data/hooks/useProfile';

export function GameScreen() {
  const config = useNicheConfig();
  const queryClient = useQueryClient();
  const session = useFlowStore((s) => s.session);
  const completeGame = useFlowStore((s) => s.completeGame);
  const setLastCravingId = useFlowStore((s) => s.setLastCravingId);
  const storedName = useOnboardingStore((s) => s.answers.name);
  const { data: profile } = useProfile();
  const firstName = (storedName || profile?.name || '').trim().split(/\s+/)[0] || undefined;

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

  const gameId = session?.selectedGame ?? 'block_stack';

  if (gameId === 'scribble') {
    return (
      <ScribbleGame
        durationSecs={config.gameDurationSecs}
        onComplete={handleComplete}
        userName={firstName}
      />
    );
  }

  if (gameId === 'flappy') {
    return (
      <FlappyGame
        durationSecs={config.gameDurationSecs}
        onComplete={handleComplete}
        userName={firstName}
      />
    );
  }

  return (
    <BlockStackGame
      durationSecs={config.gameDurationSecs}
      onComplete={handleComplete}
      userName={firstName}
    />
  );
}
