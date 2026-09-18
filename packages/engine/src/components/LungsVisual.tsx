import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  Mask,
  Path,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';
import { GlassCard } from './GlassCard';
import {
  HAZE_SPOTS,
  LUNGS_AIRWAY,
  LUNGS_BODY,
  LUNGS_TICK_LEFT,
  LUNGS_TICK_RIGHT,
  LUNGS_VIEWBOX,
} from './lungs/paths';

const SIZE = 228;
const CENTER = LUNGS_VIEWBOX / 2;
const SMOKY = '#4a403c';

interface LungsVisualProps {
  daysFree: number;
}

/**
 * Maps smoke-free days to how clear the lungs look.
 * Early days move the wipe a lot so day-by-day change is visible;
 * later days ease toward fully clear around a year.
 */
export function lungClarity(days: number): number {
  const d = Math.max(0, days);
  const points: [number, number][] = [
    [0, 0.1],
    [1, 0.22],
    [3, 0.34],
    [4, 0.38],
    [7, 0.48],
    [14, 0.6],
    [30, 0.74],
    [90, 0.88],
    [365, 1],
  ];
  if (d >= 365) return 1;
  for (let i = 1; i < points.length; i++) {
    const [d1, c1] = points[i - 1];
    const [d2, c2] = points[i];
    if (d <= d2) {
      const t = (d - d1) / (d2 - d1);
      return c1 + (c2 - c1) * t;
    }
  }
  return 1;
}

function lungCaption(days: number): string {
  if (days <= 0) return 'Still settling. Tomorrow they’ll feel different.';
  if (days === 1) return 'Day one. The haze is already thinning.';
  if (days < 7) return `${days} days of air. The grey is lifting.`;
  if (days < 14) return 'A week of quiet. They’re catching up.';
  if (days < 30) return 'Clearer every morning. Keep going.';
  if (days < 90) return 'This is what healing looks like.';
  return 'Clear. They remember every day you gave them.';
}

/**
 * Interactive lungs: idle breath, rising clean-air fill from days smoke-free,
 * fading haze. Tap for a deeper inhale.
 */
export function LungsVisual({ daysFree }: LungsVisualProps) {
  const theme = useTheme();
  const { body, label } = useTypography();
  const target = lungClarity(daysFree);

  const clarity = useSharedValue(0.08);
  const breath = useSharedValue(0);
  const tapPulse = useSharedValue(0);
  const hazeDrift = useSharedValue(0);

  useEffect(() => {
    clarity.value = withTiming(target, {
      duration: 1600,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, clarity]);

  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    hazeDrift.value = withRepeat(
      withTiming(1, { duration: 5600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [breath, hazeDrift]);

  const transform = useDerivedValue(() => {
    const scale = 1 + breath.value * 0.028 + tapPulse.value * 0.055;
    return [{ scale }];
  });

  const maskY = useDerivedValue(() => {
    return LUNGS_VIEWBOX * (1 - clarity.value) * 0.92;
  });

  const tickOpacity = useDerivedValue(() => {
    return 0.25 + breath.value * 0.55 + tapPulse.value * 0.2;
  });

  const glowOpacity = useDerivedValue(() => {
    return 0.08 + clarity.value * 0.28;
  });

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(0.08, clarity.value) }],
  }));

  const handleBreathe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    tapPulse.value = withSequence(
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) })
    );
  };

  return (
    <GlassCard style={styles.card}>
      <Text style={[label, { color: theme.text.secondary }]}>
        YOUR LUNGS
      </Text>
      <Pressable
        onPress={handleBreathe}
        accessibilityRole="button"
        accessibilityLabel="Lungs. Tap to breathe with them."
        style={styles.press}
      >
        <Canvas style={styles.canvas}>
          <Group transform={[{ scale: SIZE / LUNGS_VIEWBOX }]}>
            <Group origin={vec(CENTER, CENTER)} transform={transform}>
              <Circle cx={CENTER} cy={330} r={210} opacity={glowOpacity}>
                <RadialGradient
                  c={vec(CENTER, 340)}
                  r={210}
                  colors={[theme.accent.aqua, 'transparent']}
                />
              </Circle>

              <Path path={LUNGS_BODY} color={SMOKY} />

              <Mask
                mode="alpha"
                mask={
                  <Rect
                    x={0}
                    y={maskY}
                    width={LUNGS_VIEWBOX}
                    height={LUNGS_VIEWBOX}
                    color="white"
                  />
                }
              >
                <Path path={LUNGS_BODY} color={theme.accent.aqua} />
              </Mask>

              <Mask
                mode="alpha"
                mask={<Path path={LUNGS_BODY} color="white" />}
              >
                {HAZE_SPOTS.map((spot, index) => (
                  <HazeDot
                    key={index}
                    x={spot.x}
                    y={spot.y}
                    r={spot.r}
                    delay={index * 0.12}
                    clarity={clarity}
                    hazeDrift={hazeDrift}
                  />
                ))}
              </Mask>

              <Path path={LUNGS_AIRWAY} color={theme.text.primary} />

              <Group opacity={tickOpacity}>
                <Path path={LUNGS_TICK_LEFT} color={theme.accent.aqua} />
                <Path path={LUNGS_TICK_RIGHT} color={theme.accent.aqua} />
              </Group>
            </Group>
          </Group>
        </Canvas>
      </Pressable>

      <View
        style={[
          styles.track,
          { backgroundColor: theme.border.subtle },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            barStyle,
            { backgroundColor: theme.accent.aqua },
          ]}
        />
      </View>

      <Text
        style={[
          body,
          {
            color: theme.text.primary,
            textAlign: 'center',
            marginTop: 14,
            lineHeight: 22,
          },
        ]}
      >
        {lungCaption(daysFree)}
      </Text>
      <Text
        style={[
          label,
          {
            color: theme.text.secondary,
            textAlign: 'center',
            marginTop: 8,
            opacity: 0.7,
          },
        ]}
      >
        Tap to breathe with them
      </Text>
    </GlassCard>
  );
}

function HazeDot({
  x,
  y,
  r,
  delay,
  clarity,
  hazeDrift,
}: {
  x: number;
  y: number;
  r: number;
  delay: number;
  clarity: SharedValue<number>;
  hazeDrift: SharedValue<number>;
}) {
  const cy = useDerivedValue(() => y - hazeDrift.value * 14 - delay * 8);
  const opacity = useDerivedValue(
    () => Math.max(0, 1 - clarity.value) * 0.34 * (0.55 + delay)
  );

  return (
    <Circle cx={x} cy={cy} r={r} color="#8a7468" opacity={opacity}>
      <Blur blur={10} />
    </Circle>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  press: {
    marginTop: 8,
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
  track: {
    width: '72%',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    transformOrigin: 'left center',
  },
});
