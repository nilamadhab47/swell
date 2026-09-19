/**
 * BlockStack visual constants — piece colors, board styling, animation config.
 */

import type { Theme } from '../../theme/tokens';

/**
 * Piece color palette. Each shape id maps to a pair of gradient colors.
 * These are carefully chosen from Swell's brand palette to feel
 * premium, vibrant, and distinctly "Swell."
 */
export function getPieceColors(theme: Theme): Record<number, { from: string; to: string }> {
  if (theme.scheme === 'dark') {
    return {
      1: { from: '#5CE0D6', to: '#14B3A6' }, // I — aqua/teal
      2: { from: '#F07050', to: '#E04030' }, // O — coral
      3: { from: '#F5C054', to: '#F2A234' }, // T — sunrise gold
      4: { from: '#70D4B8', to: '#40C090' }, // J — mint
      5: { from: '#7EB8F0', to: '#5090D8' }, // L — ocean blue
      6: { from: '#F5A080', to: '#E88060' }, // S — peach
      7: { from: '#C8A0E8', to: '#A878D0' }, // Z — lavender
    };
  }

  return {
    1: { from: '#40D8CC', to: '#14B3A6' }, // I — aqua/teal
    2: { from: '#F06848', to: '#D04020' }, // O — coral
    3: { from: '#F5B840', to: '#E89820' }, // T — sunrise gold
    4: { from: '#50D0A0', to: '#30B880' }, // J — mint
    5: { from: '#60A8E8', to: '#3888D0' }, // L — ocean blue
    6: { from: '#F09070', to: '#D87050' }, // S — peach
    7: { from: '#B888E0', to: '#9868C0' }, // Z — lavender
  };
}

/** Gravity interval based on session phase. Gets slightly faster mid-session. */
export function getDropInterval(progress: number): number {
  if (progress < 0.33) return 650;
  if (progress < 0.66) return 550;
  return 480;
}

/** Board styling */
export const BOARD_PADDING = 16;
export const BLOCK_RADIUS = 5;
export const BLOCK_GAP = 2;

/** Animation timings */
export const ANIM = {
  pieceDrop: 80,
  pieceMove: 60,
  pieceLand: 120,
  lineClearFlash: 200,
  lineClearDissolve: 350,
  boardSettle: 200,
} as const;
