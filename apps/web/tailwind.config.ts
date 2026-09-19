import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        'canvas-top': 'var(--canvas-top)',
        'canvas-warm': 'var(--canvas-warm)',
        raised: 'var(--raised)',
        sunken: 'var(--sunken)',
        overlay: 'var(--overlay)',
        ink: 'var(--ink)',
        mist: 'var(--mist)',
        hush: 'var(--hush)',
        coral: 'var(--coral)',
        'coral-pressed': 'var(--coral-pressed)',
        aqua: 'var(--aqua)',
        'aqua-bright': 'var(--aqua-bright)',
        mint: 'var(--mint)',
        sunrise: 'var(--sunrise)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['var(--font-rubik)', 'system-ui', 'sans-serif'],
        display: ['var(--font-quicksand)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
        swell: '1.75rem',
      },
      boxShadow: {
        swell: 'var(--card-shadow)',
        soft: '0 12px 30px -16px rgba(14, 42, 54, 0.28)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        waveX: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
      },
      animation: {
        breathe: 'breathe 5s ease-in-out infinite',
        drift: 'drift 6s ease-in-out infinite',
        'wave-slow': 'waveX 16s linear infinite',
        'wave-mid': 'waveX 11s linear infinite',
        'wave-fast': 'waveX 8s linear infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
