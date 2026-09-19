/**
 * VictoryScreen — celebration after riding out a craving.
 *
 * This is the emotional payoff. The user has just spent 3 minutes
 * doing something difficult. This screen should feel:
 * - Warm, not childish
 * - Celebratory, not excessive
 * - Personal, not generic
 *
 * Features:
 * - Animated craving count increment
 * - Personalized "why" line from onboarding
 * - Particle-like celebration effects
 * - Stats that animate in
 * - Smooth transitions
 */

import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { OceanBackground } from '../components/OceanBackground';
import { GlowingButton } from '../components/GlowingButton';
import { useCravingStats } from '../data/hooks/useDashboard';
import { useProfile } from '../data/hooks/useProfile';
import { useFlowStore } from '../flow/useFlowStore';
import { useOnboardingStore } from '../onboarding/useOnboardingStore';
import { victoryWhyLine } from '../onboarding/victoryWhy';
import { maybeShowPostVictoryAd, useMonetization } from '../monetization';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

function AnimatedStat({
  label,
  from,
  to,
  suffix,
  delay,
}: {
  label: string;
  from: number;
  to: number;
  suffix?: string;
  delay: number;
}) {
  const theme = useTheme();
  const { caption } = useTypography();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const displayValue = useSharedValue(from);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 16, stiffness: 120 }),
    );
    displayValue.value = withDelay(
      delay + 200,
      withTiming(to, { duration: 600, easing: Easing.out(Easing.quad) }),
    );
  }, [delay, displayValue, from, opacity, to, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.stat, animStyle]}>
      <Text style={[caption, { color: theme.text.muted, textTransform: 'uppercase', letterSpacing: 1.5 }]}>
        {label}
      </Text>
      <View style={styles.statRow}>
        <Text style={[styles.statFrom, { color: theme.text.muted }]}>{from}</Text>
        <Text style={[styles.statArrow, { color: theme.text.muted }]}> → </Text>
        <Text
          style={[
            styles.statTo,
            { color: theme.state.success, fontFamily: theme.fonts.display },
          ]}
        >
          {to}
          {suffix || ''}
        </Text>
      </View>
    </Animated.View>
  );
}

export function VictoryScreen() {
  const theme = useTheme();
  const reset = useFlowStore((s) => s.reset);
  const goToReflect = useFlowStore((s) => s.goToReflect);
  const { data: profile } = useProfile();
  const storedReason = useOnboardingStore((s) => s.answers.reason);
  const { beatenThisWeek, daysClear, moneyReclaimed } = useCravingStats();
  const { ads } = useMonetization();
  const { headline, body, caption } = useTypography();

  const why = victoryWhyLine(storedReason || profile?.quitReason);
  const fromBeaten = useRef(Math.max(0, beatenThisWeek - 1));

  // Entrance animations
  const heroOp = useSharedValue(0);
  const heroY = useSharedValue(20);
  const numberOp = useSharedValue(0);
  const numberScale = useSharedValue(0.6);
  const restOp = useSharedValue(0);
  const glowOp = useSharedValue(0);
  const glowScale = useSharedValue(0.5);

  useEffect(() => {
    // Triple haptic celebration
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 300);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 500);

    // Glow burst
    glowOp.value = withSequence(
      withTiming(0.35, { duration: 400 }),
      withTiming(0.12, { duration: 800 }),
    );
    glowScale.value = withSpring(1.2, { damping: 8, stiffness: 60 });

    // Hero "You stayed."
    heroOp.value = withDelay(200, withTiming(1, { duration: 500 }));
    heroY.value = withDelay(200, withSpring(0, { damping: 16, stiffness: 120 }));

    // Big number
    numberOp.value = withDelay(500, withTiming(1, { duration: 400 }));
    numberScale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 100 }));

    // Rest of content
    restOp.value = withDelay(900, withTiming(1, { duration: 500 }));
  }, [glowOp, glowScale, heroOp, heroY, numberOp, numberScale, restOp]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOp.value,
    transform: [{ scale: glowScale.value }],
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOp.value,
    transform: [{ translateY: heroY.value }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberOp.value,
    transform: [{ scale: numberScale.value }],
  }));

  const restStyle = useAnimatedStyle(() => ({
    opacity: restOp.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />

      {/* Celebration glow burst */}
      <Animated.View
        pointerEvents="none"
        style={[styles.glowBurst, glowStyle, { backgroundColor: theme.accent.aqua }]}
      />

      <View style={styles.content}>
        {/* Hero message */}
        <Animated.View style={[styles.heroWrap, heroStyle]}>
          <Text
            style={[
              headline,
              {
                color: theme.text.primary,
                textAlign: 'center',
                fontSize: 28,
              },
            ]}
          >
            You stayed.
          </Text>
          {why ? (
            <Text
              style={[
                body,
                {
                  color: theme.text.secondary,
                  textAlign: 'center',
                  marginTop: 8,
                  lineHeight: 24,
                  maxWidth: 280,
                },
              ]}
            >
              {why}
            </Text>
          ) : (
            <Text
              style={[
                body,
                {
                  color: theme.text.secondary,
                  textAlign: 'center',
                  marginTop: 8,
                  lineHeight: 24,
                },
              ]}
            >
              That craving came and went.{'\n'}You stayed.
            </Text>
          )}
        </Animated.View>

        {/* Big craving count */}
        <Animated.View style={[styles.bigNumber, numberStyle]}>
          <Text style={[caption, { color: theme.text.muted }]}>
            {fromBeaten.current} → {beatenThisWeek}
          </Text>
          <Text
            style={[
              styles.bigNumberValue,
              {
                color: theme.state.success,
                fontFamily: theme.fonts.display,
              },
            ]}
          >
            {beatenThisWeek}
          </Text>
          <Text style={[caption, { color: theme.text.secondary, marginTop: 2 }]}>
            cravings that didn't win
          </Text>
        </Animated.View>

        {/* Stats row */}
        <Animated.View style={[styles.statsRow, restStyle]}>
          <AnimatedStat
            label="Days clear"
            from={daysClear}
            to={daysClear}
            delay={1000}
          />
          <AnimatedStat
            label="This week"
            from={fromBeaten.current}
            to={beatenThisWeek}
            delay={1150}
          />
          <AnimatedStat
            label="Money back"
            from={Math.max(0, Math.round(moneyReclaimed))}
            to={Math.round(moneyReclaimed)}
            suffix="₹"
            delay={1300}
          />
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, restStyle]}>
          <GlowingButton
            label="Remember this one"
            onPress={goToReflect}
            variant="glass"
            style={styles.actionBtn}
          />
          <Pressable
            onPress={() => {
              void maybeShowPostVictoryAd(ads).then(reset);
            }}
            style={styles.skipBtn}
            hitSlop={8}
          >
            <Text style={[body, { color: theme.text.muted }]}>Not now</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  glowBurst: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    alignSelf: 'center',
    top: '25%',
    opacity: 0,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bigNumber: {
    alignItems: 'center',
    marginBottom: 28,
  },
  bigNumberValue: {
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 36,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statFrom: {
    fontSize: 16,
    fontWeight: '500',
  },
  statArrow: {
    fontSize: 14,
  },
  statTo: {
    fontSize: 22,
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
});
