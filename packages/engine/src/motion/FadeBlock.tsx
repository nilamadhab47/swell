import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { staggerIn } from './presets';

interface FadeBlockProps {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Calm staggered entrance for stacked page sections. */
export function FadeBlock({ delay = 0, style, children }: FadeBlockProps) {
  return (
    <Animated.View entering={staggerIn(delay)} style={style}>
      {children}
    </Animated.View>
  );
}
