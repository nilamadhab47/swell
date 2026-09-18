export type ColorScheme = 'light' | 'dark';
export type SchemePreference = ColorScheme | 'system';

export interface Theme {
  scheme: ColorScheme;
  surface: {
    canvas: string;
    raised: string;
    sunken: string;
    bright: string;
    glass: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  accent: {
    coral: string;
    coralPressed: string;
    aqua: string;
    mint: string;
    sunrise: string;
  };
  state: {
    success: string;
    warning: string;
    danger: string;
  };
  border: {
    subtle: string;
    strong: string;
  };
  signature: {
    tideDeep: string;
    tideRise: string;
    horizon: string;
    heatStart: string;
    heatMid: string;
    calmEnd: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  space: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  motion: {
    fast: number;
    base: number;
    calm: number;
    breath: number;
  };
  opacity: {
    disabled: number;
    muted: number;
    whisper: number;
  };
  icon: {
    sm: number;
    md: number;
    lg: number;
  };
  hit: {
    min: number;
  };
}

export const FONTS = {
  display: 'Quicksand_600SemiBold',
  body: 'Rubik_400Regular',
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 9999,
} as const;

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const MOTION = {
  fast: 180,
  base: 280,
  calm: 480,
  breath: 3200,
} as const;

export const OPACITY = {
  disabled: 0.45,
  muted: 0.6,
  whisper: 0.35,
} as const;

export const ICON = {
  sm: 16,
  md: 22,
  lg: 28,
} as const;

export const HIT = {
  min: 44,
} as const;
