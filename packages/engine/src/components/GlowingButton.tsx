import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

interface GlowingButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'coral' | 'glass';
  disabled?: boolean;
}

/**
 * Primary action button. Solid coral for the main CTA, flat surface for
 * secondary actions. Press feedback is a quick scale + haptic — no
 * continuous pulsing or glow.
 */
export function GlowingButton({
  label,
  onPress,
  style,
  variant = 'coral',
  disabled = false,
}: GlowingButtonProps) {
  const theme = useTheme();
  const { title } = useTypography();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isCoral = variant === 'coral';

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={() => {
          if (disabled) return;
          scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20, stiffness: 300 });
        }}
        onPress={() => {
          if (disabled) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        disabled={disabled}
        style={[
          styles.pressable,
          {
            borderRadius: theme.radius.pill,
            backgroundColor: isCoral
              ? theme.accent.coral
              : theme.surface.glass,
            borderWidth: isCoral ? 0 : StyleSheet.hairlineWidth,
            borderColor: theme.border.subtle,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        <Text
          style={[
            title,
            styles.label,
            {
              color: isCoral ? theme.text.inverse : theme.text.primary,
              letterSpacing: isCoral ? 0.3 : 0.15,
              fontWeight: '600',
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
