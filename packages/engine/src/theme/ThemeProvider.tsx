import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';
import type { ColorScheme, SchemePreference, Theme } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  preference: SchemePreference;
  setPreference: (preference: SchemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(
  preference: SchemePreference,
  system: ColorSchemeName
): ColorScheme {
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<SchemePreference>('light');
  const [system, setSystem] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystem(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const scheme = resolveScheme(preference, system);
  const theme = scheme === 'light' ? lightTheme : darkTheme;

  const value = useMemo(
    () => ({ theme, preference, setPreference }),
    [theme, preference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function useColorSchemePreference() {
  const { preference, setPreference, theme } = useThemeContext();
  const cycle = useCallback(() => {
    const next: SchemePreference =
      preference === 'system'
        ? 'dark'
        : preference === 'dark'
          ? 'light'
          : 'system';
    setPreference(next);
  }, [preference, setPreference]);
  return { preference, setPreference, scheme: theme.scheme, cycle };
}
