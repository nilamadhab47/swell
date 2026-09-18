import { create } from 'zustand';
import type { CravingSession, FlowState, GameId, ReflectionNote } from './types';

interface FlowStore {
  state: FlowState;
  session: CravingSession | null;
  cravingsBeatenThisWeek: number;
  lastReflection: ReflectionNote | null;
  lastCravingId: string | null;

  startFight: () => void;
  selectGame: (gameId: GameId) => void;
  completeGame: (durationSecs: number) => void;
  setLastCravingId: (id: string | null) => void;
  goToReflect: () => void;
  goToVictory: () => void;
  saveReflection: (note: Omit<ReflectionNote, 'savedAt'>) => void;
  reset: () => void;
  setCravingsBeatenThisWeek: (count: number) => void;
  /** __DEV__ only — jump to any flow screen with sensible mock session data. */
  devJumpTo: (state: FlowState) => void;
}

export const useFlowStore = create<FlowStore>((set) => ({
  state: 'idle',
  session: null,
  cravingsBeatenThisWeek: 0,
  lastReflection: null,
  lastCravingId: null,

  // Only one game exists today, so "fight" goes straight into it.
  // When more games ship, route to 'game_select' here instead.
  startFight: () =>
    set({
      state: 'game',
      session: {
        startedAt: Date.now(),
        selectedGame: 'block_stack',
        durationSecs: 0,
        beaten: false,
      },
    }),

  selectGame: (gameId: GameId) =>
    set((s) => ({
      state: 'game',
      session: s.session
        ? { ...s.session, selectedGame: gameId }
        : {
            startedAt: Date.now(),
            selectedGame: gameId,
            durationSecs: 0,
            beaten: false,
          },
    })),

  completeGame: (durationSecs: number) =>
    set((s) => ({
      state: 'victory',
      session: s.session
        ? { ...s.session, durationSecs, beaten: true }
        : null,
      cravingsBeatenThisWeek: s.cravingsBeatenThisWeek + 1,
    })),

  goToReflect: () => set({ state: 'reflect' }),

  setLastCravingId: (id) => set({ lastCravingId: id }),

  goToVictory: () => set({ state: 'victory' }),

  saveReflection: (note) =>
    set((s) => ({
      state: 'idle',
      lastReflection: { ...note, savedAt: Date.now() },
      session: s.session
        ? {
            ...s.session,
            triggerNote: note.triggerNote,
            voiceNoteUri: note.voiceNoteUri,
            transcript: note.transcript,
          }
        : null,
    })),

  reset: () => set({ state: 'idle', session: null }),

  setCravingsBeatenThisWeek: (count: number) =>
    set({ cravingsBeatenThisWeek: count }),

  devJumpTo: (state: FlowState) => {
    if (state === 'idle') {
      set({ state: 'idle', session: null });
      return;
    }

    const session: CravingSession = {
      startedAt: Date.now() - 120_000,
      selectedGame: 'block_stack',
      durationSecs: 178,
      beaten: state === 'victory' || state === 'reflect',
    };

    set({
      state,
      session,
      cravingsBeatenThisWeek:
        state === 'victory' || state === 'reflect' ? 4 : 3,
    });
  },
}));
