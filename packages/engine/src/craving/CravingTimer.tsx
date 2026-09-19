/**
 * CravingTimer — a beautiful circular countdown ring.
 *
 * Shows remaining time as MM:SS inside an animated Skia arc.
 * The ring fills from coral → aqua as the session progresses.
 * Integrated into the game UI header, not a boring clock widget.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

interface CravingTimerProps {
  /** Total session duration in seconds */
  totalSecs: number;
  /** Seconds remaining */
  remainingSecs: number;
  /** 0..1 how far through the session */
  progress: number;
}

const SIZE = 72;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function makeArcPath(progress: number): string {
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + Math.PI * 2 * progress;
  const x1 = CENTER + RADIUS * Math.cos(startAngle);
  const y1 = CENTER + RADIUS * Math.sin(startAngle);
  const x2 = CENTER + RADIUS * Math.cos(endAngle);
  const y2 = CENTER + RADIUS * Math.sin(endAngle);
  const largeArc = progress > 0.5 ? 1 : 0;

  if (progress >= 0.999) {
    return [
      `M ${x1} ${y1}`,
      `A ${RADIUS} ${RADIUS} 0 1 1 ${CENTER + RADIUS * Math.cos(startAngle + Math.PI)} ${CENTER + RADIUS * Math.sin(startAngle + Math.PI)}`,
      `A ${RADIUS} ${RADIUS} 0 1 1 ${x1} ${y1}`,
    ].join(' ');
  }

  return [
    `M ${x1} ${y1}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`,
  ].join(' ');
}

export function CravingTimer({ totalSecs, remainingSecs, progress }: CravingTimerProps) {
  const theme = useTheme();
  const pulseScale = useSharedValue(1);

  const isEndingSoon = remainingSecs <= 10;

  useEffect(() => {
    if (isEndingSoon) {
      pulseScale.value = withRepeat(
        withTiming(1.06, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isEndingSoon, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const arcPath = Skia.Path.MakeFromSVGString(makeArcPath(clampedProgress));
  const timeStr = formatTime(remainingSecs);

  const ringTrackColor = theme.scheme === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(14,42,54,0.06)';

  const ringColor = clampedProgress < 0.5
    ? theme.accent.coral
    : clampedProgress < 0.85
      ? theme.accent.aqua
      : theme.state.success;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Canvas style={styles.canvas}>
        {/* Track ring */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          style="stroke"
          strokeWidth={STROKE}
          color={ringTrackColor}
        />
        {/* Progress arc */}
        {arcPath && (
          <Path
            path={arcPath}
            style="stroke"
            strokeWidth={STROKE}
            strokeCap="round"
            color={ringColor}
          />
        )}
        {/* Glow dot at arc end */}
        {clampedProgress > 0.01 && (
          <Circle
            cx={CENTER + RADIUS * Math.cos(-Math.PI / 2 + Math.PI * 2 * clampedProgress)}
            cy={CENTER + RADIUS * Math.sin(-Math.PI / 2 + Math.PI * 2 * clampedProgress)}
            r={3}
            color={ringColor}
            opacity={0.5}
          />
        )}
      </Canvas>
      <View style={styles.textWrap}>
        <Animated.Text
          style={[
            styles.time,
            {
              color: isEndingSoon ? theme.state.success : theme.text.primary,
              fontFamily: theme.fonts.display,
            },
          ]}
        >
          {timeStr}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: SIZE,
    height: SIZE,
    position: 'absolute',
  },
  textWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
