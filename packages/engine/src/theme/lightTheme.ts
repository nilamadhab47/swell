import {
  FONTS,
  HIT,
  ICON,
  MOTION,
  OPACITY,
  RADIUS,
  SPACE,
  type Theme,
} from './tokens';

/**
 * Sky day — soft cyan wash, warm coral primary, teal-aqua secondary.
 * Muted enough to sit next to for hours. Nothing at 100% saturation.
 */
export const lightTheme: Theme = {
  scheme: 'light',
  surface: {
    canvas: '#eaf4f8',
    raised: '#ffffff',
    sunken: '#d9ebf1',
    bright: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.78)',
    overlay: 'rgba(8, 40, 56, 0.35)',
  },
  text: {
    primary: '#0e2a36',
    secondary: '#3a6a76',
    muted: '#6b8f98',
    inverse: '#ffffff',
  },
  accent: {
    coral: '#f04a2f',
    coralPressed: '#c9371f',
    aqua: '#14b3a6',
    mint: '#5cd5c4',
    sunrise: '#f2a234',
  },
  state: {
    success: '#14b3a6',
    warning: '#d78a1e',
    danger: '#c9361f',
  },
  border: {
    subtle: 'rgba(12, 60, 76, 0.09)',
    strong: 'rgba(240, 74, 47, 0.6)',
  },
  signature: {
    tideDeep: '#e3eff4',
    tideRise: '#b4dbe8',
    horizon: '#8ac4de',
    heatStart: '#ee6a44',
    heatMid: '#f1a054',
    calmEnd: '#14b3a6',
  },
  fonts: FONTS,
  radius: RADIUS,
  space: SPACE,
  motion: MOTION,
  opacity: OPACITY,
  icon: ICON,
  hit: HIT,
};
