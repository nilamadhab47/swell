import type { GameId } from './types';

export const PLAYABLE_GAMES = ['block_stack', 'scribble', 'flappy'] as const;
export type PlayableGame = (typeof PLAYABLE_GAMES)[number];

export function isPlayableGame(id: string | null | undefined): id is PlayableGame {
  return id === 'block_stack' || id === 'scribble' || id === 'flappy';
}

/** Random playable game. Optional exclude so Surprise me can skip the last ride. */
export function pickSurprise(exclude?: GameId | null): PlayableGame {
  const pool = PLAYABLE_GAMES.filter((id) => id !== exclude);
  const from = pool.length > 0 ? pool : PLAYABLE_GAMES;
  return from[Math.floor(Math.random() * from.length)] ?? 'block_stack';
}

export const LAST_GAME_KEY = 'swell.lastGame';

async function storage() {
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

export async function loadLastGame(): Promise<PlayableGame | null> {
  try {
    const ss = await storage();
    const raw = ss ? await ss.getItemAsync(LAST_GAME_KEY) : null;
    return isPlayableGame(raw) ? raw : null;
  } catch {
    return null;
  }
}

export async function saveLastGame(id: PlayableGame): Promise<void> {
  if (!isPlayableGame(id)) return;
  try {
    const ss = await storage();
    await ss?.setItemAsync(LAST_GAME_KEY, id);
  } catch {
    // Last-game hint is optional.
  }
}
