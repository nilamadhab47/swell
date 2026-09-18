import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Circle,
  LinearGradient,
  RadialGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';

interface OceanBackgroundProps {
  /** 0–1 heat overlay for game screen; omit for ambient home bg */
  heatProgress?: number;
}

const { width: W, height: H } = Dimensions.get('window');

/**
 * Calm sky wash — one gradient top-to-bottom + a single soft warm well.
 * No sun blobs, no double glow. Same shape in dark mode with different tokens.
 */
export function OceanBackground({ heatProgress }: OceanBackgroundProps) {
  const theme = useTheme();
  const heat = heatProgress ?? 0;
  const [reduceMotion, setReduceMotion] = useState(false);
  const breath = useSharedValue(0.4);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      breath.value = 0.5;
      return;
    }
    breath.value = withRepeat(
      withTiming(1, { duration: theme.motion.breath, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [breath, reduceMotion, theme.motion.breath]);

  const wellOp = useDerivedValue(() => 0.14 + breath.value * 0.08);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={W} height={H}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, H)}
            colors={[
              theme.signature.horizon,
              theme.signature.tideRise,
              theme.signature.tideDeep,
              theme.surface.canvas,
            ]}
          />
        </Rect>

        {/* Ambient warm well behind CTA — very low, no grey bleed */}
        <Circle cx={W / 2} cy={H * 0.6} r={W * 0.7} opacity={wellOp}>
          <RadialGradient
            c={vec(W / 2, H * 0.6)}
            r={W * 0.7}
            colors={['#ffb08a', 'rgba(255, 176, 138, 0.15)', 'transparent']}
            positions={[0, 0.4, 1]}
          />
        </Circle>

        {heat > 0 && (
          <Rect x={0} y={0} width={W} height={H} opacity={heat * 0.4}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(W * 0.6, H * 0.7)}
              colors={[theme.signature.heatStart, 'transparent']}
            />
          </Rect>
        )}
      </Canvas>
    </View>
  );
}
