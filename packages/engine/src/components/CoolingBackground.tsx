import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  LinearGradient,
  Rect,
  vec,
} from '@shopify/react-native-skia';
import { useTheme } from '../theme/useTheme';

interface CoolingBackgroundProps {
  /** 0 = full heat (coral), 1 = full calm (cyan) */
  coolProgress: number;
}

function lerpColor(a: string, bColor: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(bColor);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const blue = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${blue})`;
}

export function CoolingBackground({ coolProgress }: CoolingBackgroundProps) {
  const theme = useTheme();
  const t = Math.min(1, Math.max(0, coolProgress));

  const heatColor = lerpColor(theme.signature.heatStart, theme.signature.heatMid, t * 0.4);
  const midColor = lerpColor(theme.signature.heatMid, theme.signature.calmEnd, t);
  const calmColor = lerpColor(
    theme.signature.tideDeep,
    theme.signature.calmEnd,
    t
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={1000} height={2000}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(400, 800)}
            colors={[
              theme.surface.canvas,
              calmColor,
              midColor,
              heatColor,
            ]}
          />
        </Rect>
      </Canvas>
    </View>
  );
}
