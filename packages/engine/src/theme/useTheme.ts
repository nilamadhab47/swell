import type { Theme } from './tokens';
import { useThemeContext } from './ThemeProvider';

export function useTheme(): Theme {
  return useThemeContext().theme;
}
