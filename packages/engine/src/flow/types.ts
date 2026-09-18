export type FlowState =
  | 'idle'
  | 'fight'
  | 'game_select'
  | 'game'
  | 'victory'
  | 'reflect';

export type GameId = 'block_stack' | 'color_match' | 'flow_connect' | 'tap_rhythm';

export interface CravingSession {
  startedAt: number;
  selectedGame: GameId | null;
  durationSecs: number;
  beaten: boolean;
  triggerNote?: string;
  voiceNoteUri?: string;
  transcript?: string;
}

export interface ReflectionNote {
  triggerNote: string;
  voiceNoteUri?: string;
  transcript?: string;
  savedAt: number;
}
