import React, { useEffect } from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ArtEmblemProps {
  source: ImageSourcePropType;
  /** Rendered width/height in points. */
  size?: number;
  /** Delay before the entrance animation, ms. */
  delay?: number;
  /** A bigger, springier "pop" entrance for celebratory moments. */
  celebrate?: boolean;
  /** For full-bleed scene art (no transparency): clip into a rounded card. */
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A drop-in wrapper for the generated artwork. Fades + scales in on mount,
 * then breathes gently (float + subtle scale) so the art feels alive without
 * ever being distracting.
 */
export function ArtEmblem({
  source,
  size = 200,
  delay = 0,
  celebrate = false,
  rounded = false,
  style,
}: ArtEmblemProps) {
  const enter = useSharedValue(0);
  const loop = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(
      delay,
      celebrate
        ? withSpring(1, { damping: 10, stiffness: 120, mass: 0.8 })
        : withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })
    );
    loop.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [celebrate, delay, enter, loop]);

  const animStyle = useAnimatedStyle(() => {
    const entered = enter.value;
    return {
      opacity: entered,
      transform: [
        { translateY: (1 - entered) * 16 - loop.value * 6 },
        { scale: (0.86 + 0.14 * entered) * (1 + loop.value * 0.02) },
      ],
    };
  });

  return (
    <Animated.View style={[animStyle, style]}>
      <Image
        source={source}
        style={{
          width: size,
          height: size,
          borderRadius: rounded ? size * 0.16 : 0,
        }}
        resizeMode={rounded ? 'cover' : 'contain'}
      />
    </Animated.View>
  );
}

// Central registry so screens import art from one place.
export const ART = {
  victory: require('../assets/art/victory.png') as ImageSourcePropType,
  streak: require('../assets/art/streak.png') as ImageSourcePropType,
  milestone: require('../assets/art/milestone.png') as ImageSourcePropType,
  money: require('../assets/art/money.png') as ImageSourcePropType,
  empty: require('../assets/art/empty.png') as ImageSourcePropType,
  breathe: require('../assets/art/breathe.png') as ImageSourcePropType,
};
