import React, { useEffect } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface AnimatedCountProps {
  value: number;
  style?: StyleProp<TextStyle>;
}

/** Brief spring when the count ticks up after a victory. */
export function AnimatedCount({ value, style }: AnimatedCountProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1.1, { damping: 10, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 160 });
    });
  }, [value, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={style}>{value}</Text>
    </Animated.View>
  );
}
