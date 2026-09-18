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

/** Night lagoon — same coral/aqua, still loud. */
export const darkTheme: Theme = {
  scheme: 'dark',
  surface: {
    canvas: '#042028',
    raised: '#0a3340',
    sunken: '#02141c',
    bright: '#124858',
    glass: 'rgba(0, 210, 196, 0.1)',
    overlay: 'rgba(2, 16, 24, 0.72)',
  },
  text: {
    primary: '#f3fffc',
    secondary: '#8ee8dc',
    muted: '#5aaea6',
    inverse: '#ffffff',
  },
  accent: {
    coral: '#ff5a3a',
    coralPressed: '#e04022',
    aqua: '#2ef0d4',
    mint: '#7affdc',
    sunrise: '#ffc43c',
  },
  state: {
    success: '#2ef0d4',
    warning: '#ffb430',
    danger: '#ff6a5e',
  },
  border: {
    subtle: 'rgba(80, 240, 220, 0.18)',
    strong: 'rgba(255, 90, 58, 0.75)',
  },
  signature: {
    tideDeep: '#063848',
    tideRise: '#0e6a80',
    horizon: '#14a0c0',
    heatStart: '#ff5a32',
    heatMid: '#ffb04a',
    calmEnd: '#20e0c0',
  },
  fonts: FONTS,
  radius: RADIUS,
  space: SPACE,
  motion: MOTION,
  opacity: OPACITY,
  icon: ICON,
  hit: HIT,
};
