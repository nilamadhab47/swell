import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** kept for API compatibility; no visual glow anymore */
  neon?: boolean;
}

/** Flat dark surface card with a hairline border. No blur, no glow. */
export function GlassCard({ children, style }: GlassCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            theme.scheme === 'light' ? theme.surface.raised : theme.surface.glass,
          borderColor: theme.border.subtle,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
