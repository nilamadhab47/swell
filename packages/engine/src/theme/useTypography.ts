import type { TextStyle } from 'react-native';
import { useTheme } from './useTheme';

export function useTypography() {
  const theme = useTheme();

  const mega: TextStyle = {
    fontFamily: theme.fonts.display,
    fontSize: 96,
    fontWeight: '600',
    lineHeight: 100,
    letterSpacing: -3,
  };

  const hero: TextStyle = {
    fontFamily: theme.fonts.display,
    fontSize: 64,
    fontWeight: '600',
    lineHeight: 68,
    letterSpacing: -2,
  };

  const display: TextStyle = {
    fontFamily: theme.fonts.display,
    fontSize: 40,
    fontWeight: '600',
    lineHeight: 48,
    letterSpacing: -0.5,
  };

  const headline: TextStyle = {
    fontFamily: theme.fonts.display,
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 34,
  };

  const title: TextStyle = {
    fontFamily: theme.fonts.body,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
  };

  const body: TextStyle = {
    fontFamily: theme.fonts.body,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  };

  const bodyLg: TextStyle = {
    fontFamily: theme.fonts.body,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
  };

  const label: TextStyle = {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  };

  const caption: TextStyle = {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  };

  return { mega, hero, display, headline, title, body, bodyLg, label, caption };
}
