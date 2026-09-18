import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

const BREATHE_ART = require('../assets/art/breathe.png');

/** Diameter of the ring artwork that now serves as the primary CTA. */
const ORB = 240;

interface BreathingOrbProps {
  label: string;
  caption?: string;
  onPress: () => void;
  launching?: boolean;
}

export function BreathingOrb({
  label,
  caption,
  onPress,
  launching = false,
}: BreathingOrbProps) {
  const theme = useTheme();
  const { title, caption: captionType } = useTypography();
  const [reduceMotion, setReduceMotion] = useState(false);
  const breath = useSharedValue(0);
  const press = useSharedValue(1);
  const expand = useSharedValue(1);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || launching) {
      breath.value = 0.4;
      return;
    }
    breath.value = withRepeat(
      withTiming(1, {
        duration: theme.motion.breath,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [breath, launching, reduceMotion, theme.motion.breath]);

  useEffect(() => {
    if (!launching) {
      expand.value = 1;
      return;
    }
    expand.value = withTiming(14, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [expand, launching]);

  // The ring artwork gently breathes: subtle scale in/out, plus press + launch.
  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: press.value * expand.value * (1 + breath.value * 0.05) },
    ],
  }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Animated.View style={[styles.orbWrap, artStyle]} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPressIn={() => {
            press.value = withSpring(0.94, { damping: 20, stiffness: 300 });
          }}
          onPressOut={() => {
            press.value = withSpring(1, { damping: 18, stiffness: 220 });
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
          }}
          style={styles.hit}
        >
          <Image
            source={BREATHE_ART}
            style={styles.art}
            resizeMode="contain"
            pointerEvents="none"
          />
          <View pointerEvents="none" style={styles.labelWrap}>
            <Text
              style={[
                title,
                styles.label,
                {
                  color: theme.text.inverse,
                  fontFamily: theme.fonts.display,
                },
              ]}
            >
              {label}
            </Text>
            {caption ? (
              <Text
                style={[captionType, styles.captionText, { color: theme.text.inverse }]}
              >
                {caption}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: ORB,
    height: ORB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbWrap: {
    width: ORB,
    height: ORB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hit: {
    width: ORB,
    height: ORB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    ...StyleSheet.absoluteFillObject,
    width: ORB,
    height: ORB,
  },
  labelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  label: {
    fontWeight: '600',
    fontSize: 19,
    lineHeight: 22,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  captionText: {
    opacity: 0.95,
    marginTop: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});
