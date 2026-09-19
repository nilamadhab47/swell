/**
 * Craving encouragement message engine.
 *
 * Messages are shown during the 3-minute craving intervention to keep the
 * user grounded, calm, and moving forward. They should never shame, lecture,
 * or make medical claims.
 *
 * Messages are selected based on remaining time and phase of the session.
 * The engine is stateless — call `getMessageForTime` with the seconds
 * remaining and it returns the appropriate message.
 */

export type CravingPhase = 'start' | 'early' | 'middle' | 'late' | 'final';

export interface CravingMessage {
  id: string;
  phase: CravingPhase;
  /** Minimum remaining seconds (inclusive) to show this message */
  minRemaining: number;
  /** Maximum remaining seconds (inclusive) to show this message */
  maxRemaining: number;
  text: string;
  category: 'calm' | 'encouragement' | 'reframing' | 'progress' | 'final';
}

const MESSAGES: CravingMessage[] = [
  // --- START (3:00–2:31) ---
  {
    id: 'start-1',
    phase: 'start',
    minRemaining: 165,
    maxRemaining: 180,
    text: "The craving is here. That's okay.",
    category: 'calm',
  },
  {
    id: 'start-2',
    phase: 'start',
    minRemaining: 155,
    maxRemaining: 164,
    text: "You showed up. That's the hardest part.",
    category: 'encouragement',
  },
  {
    id: 'start-3',
    phase: 'start',
    minRemaining: 151,
    maxRemaining: 180,
    text: 'An urge is a feeling. It passes.',
    category: 'reframing',
  },

  // --- EARLY (2:30–2:01) ---
  {
    id: 'early-1',
    phase: 'early',
    minRemaining: 131,
    maxRemaining: 150,
    text: "You don't need to solve everything right now.",
    category: 'calm',
  },
  {
    id: 'early-2',
    phase: 'early',
    minRemaining: 121,
    maxRemaining: 140,
    text: "Let your hands do the thinking for a bit.",
    category: 'reframing',
  },
  {
    id: 'early-3',
    phase: 'early',
    minRemaining: 121,
    maxRemaining: 150,
    text: "This craving has a shelf life. You're outlasting it.",
    category: 'encouragement',
  },

  // --- MIDDLE (2:00–1:01) ---
  {
    id: 'mid-1',
    phase: 'middle',
    minRemaining: 91,
    maxRemaining: 120,
    text: 'Just stay with the next minute.',
    category: 'calm',
  },
  {
    id: 'mid-2',
    phase: 'middle',
    minRemaining: 75,
    maxRemaining: 100,
    text: "You're already getting through it.",
    category: 'progress',
  },
  {
    id: 'mid-3',
    phase: 'middle',
    minRemaining: 61,
    maxRemaining: 90,
    text: 'Every second here is a second you chose yourself.',
    category: 'encouragement',
  },
  {
    id: 'mid-4',
    phase: 'middle',
    minRemaining: 61,
    maxRemaining: 120,
    text: "The urge doesn't get to decide what happens next.",
    category: 'reframing',
  },

  // --- LATE (1:00–0:11) ---
  {
    id: 'late-1',
    phase: 'late',
    minRemaining: 45,
    maxRemaining: 60,
    text: 'One minute. Keep going.',
    category: 'progress',
  },
  {
    id: 'late-2',
    phase: 'late',
    minRemaining: 31,
    maxRemaining: 50,
    text: "You're doing something difficult. One moment at a time.",
    category: 'encouragement',
  },
  {
    id: 'late-3',
    phase: 'late',
    minRemaining: 20,
    maxRemaining: 35,
    text: 'Thirty seconds. Keep going.',
    category: 'progress',
  },
  {
    id: 'late-4',
    phase: 'late',
    minRemaining: 11,
    maxRemaining: 25,
    text: 'Almost there.',
    category: 'progress',
  },

  // --- FINAL (0:10–0:00) ---
  {
    id: 'final-1',
    phase: 'final',
    minRemaining: 0,
    maxRemaining: 10,
    text: 'You made it through.',
    category: 'final',
  },
];

/**
 * Determine which phase of the craving session we're in.
 */
export function getPhase(remainingSecs: number): CravingPhase {
  if (remainingSecs > 150) return 'start';
  if (remainingSecs > 120) return 'early';
  if (remainingSecs > 60) return 'middle';
  if (remainingSecs > 10) return 'late';
  return 'final';
}

/**
 * Return the best encouragement message for the current time remaining.
 *
 * Uses a seeded selection so the same second always returns the same message
 * within a session, preventing flicker.
 *
 * If `name` is provided, some messages are personalized with the user's first name.
 */
export function getMessageForTime(
  remainingSecs: number,
  sessionSeed?: number,
  name?: string,
): CravingMessage | null {
  const candidates = MESSAGES.filter(
    (m) => remainingSecs >= m.minRemaining && remainingSecs <= m.maxRemaining,
  );

  if (candidates.length === 0) return null;

  const seed = sessionSeed ?? 0;
  const idx = candidates.length === 1
    ? 0
    : Math.abs(seed + Math.floor(remainingSecs / 15)) % candidates.length;
  const msg = candidates[idx];

  if (!name) return msg;

  return { ...msg, text: personalize(msg.text, name) };
}

/** Inject the user's first name into select message patterns. */
function personalize(text: string, name: string): string {
  const personalMap: Record<string, string> = {
    "You showed up. That's the hardest part.": `${name}, you showed up. That's the hardest part.`,
    "You're already getting through it.": `${name}, you're already getting through it.`,
    'One minute. Keep going.': `One minute, ${name}. Keep going.`,
    'Almost there.': `Almost there, ${name}.`,
    'You made it through.': `${name}, you made it through.`,
  };
  return personalMap[text] ?? text;
}

/**
 * Get the "trigger" seconds where a new message should fade in.
 * Used by the UI to schedule transitions.
 */
export const MESSAGE_TRIGGER_SECONDS = [175, 155, 140, 120, 95, 75, 55, 30, 15, 5];

/**
 * All messages for external use (settings, content preview, etc.)
 */
export function getAllMessages(): CravingMessage[] {
  return [...MESSAGES];
}
