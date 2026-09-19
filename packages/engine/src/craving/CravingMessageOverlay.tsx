/**
 * CravingMessageOverlay — gently fading encouragement text shown during play.
 *
 * Positioned above the game board. Messages fade in, hold, then fade out.
 * They never interrupt gameplay or feel intrusive.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getMessageForTime, type CravingMessage } from './messages';
import { useTheme } from '../theme/useTheme';

interface CravingMessageOverlayProps {
  remainingSecs: number;
  sessionSeed: number;
  /** User's first name for personalized messages. */
  userName?: string;
}

const FADE_IN = 600;
const HOLD = 3200;
const FADE_OUT = 800;

export function CravingMessageOverlay({
  remainingSecs,
  sessionSeed,
  userName,
}: CravingMessageOverlayProps) {
  const theme = useTheme();
  const [displayText, setDisplayText] = useState('');
  const lastMessageId = useRef('');
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);

  useEffect(() => {
    const msg = getMessageForTime(remainingSecs, sessionSeed, userName);
    if (!msg || msg.id === lastMessageId.current) return;

    lastMessageId.current = msg.id;
    setDisplayText(msg.text);

    opacity.value = withSequence(
      withTiming(1, { duration: FADE_IN, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: HOLD }),
      withTiming(0, { duration: FADE_OUT, easing: Easing.in(Easing.ease) }),
    );
    translateY.value = withSequence(
      withTiming(0, { duration: FADE_IN, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: HOLD }),
      withTiming(-4, { duration: FADE_OUT, easing: Easing.in(Easing.ease) }),
    );
  }, [remainingSecs, sessionSeed, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!displayText) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text
        style={[
          styles.text,
          animatedStyle,
          {
            color: theme.text.secondary,
            fontFamily: theme.fonts.body,
          },
        ]}
      >
        {displayText}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 36,
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});
