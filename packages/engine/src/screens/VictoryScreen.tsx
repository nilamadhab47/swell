import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ArtEmblem, ART } from '../components/ArtEmblem';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { useCravingStats } from '../data/hooks/useDashboard';
import { useProfile } from '../data/hooks/useProfile';
import { useFlowStore } from '../flow/useFlowStore';
import { useOnboardingStore } from '../onboarding/useOnboardingStore';
import { victoryWhyLine } from '../onboarding/victoryWhy';
import { maybeShowPostVictoryAd, useMonetization } from '../monetization';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

/**
 * Victory is a release, not a dashboard. The increment is the celebration.
 */
export function VictoryScreen() {
  const theme = useTheme();
  const reset = useFlowStore((s) => s.reset);
  const goToReflect = useFlowStore((s) => s.goToReflect);
  const { data: profile } = useProfile();
  const storedReason = useOnboardingStore((s) => s.answers.reason);
  const { beatenThisWeek } = useCravingStats();
  const { ads } = useMonetization();
  const { hero, headline, body, caption } = useTypography();

  const why = victoryWhyLine(storedReason || profile?.quitReason);
  const fromRef = useRef(Math.max(0, beatenThisWeek - 1));
  const from = fromRef.current;

  const wash = useSharedValue(0);
  const numberY = useSharedValue(12);
  const numberOp = useSharedValue(0);
  const restOp = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    wash.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    numberOp.value = withTiming(1, { duration: 280 });
    numberY.value = withSpring(0, { damping: 16, stiffness: 140 });
    restOp.value = withDelay(360, withTiming(1, { duration: 420 }));
  }, [numberOp, numberY, restOp, wash]);

  const washStyle = useAnimatedStyle(() => ({
    opacity: wash.value * 0.22,
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberOp.value,
    transform: [{ translateY: numberY.value }],
  }));

  const restStyle = useAnimatedStyle(() => ({
    opacity: restOp.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          washStyle,
          { backgroundColor: theme.accent.sunrise },
        ]}
      />

      <View style={styles.content}>
        <ArtEmblem source={ART.victory} size={150} celebrate style={styles.burst} />

        <Animated.View style={[styles.heroWrap, numberStyle]}>
          <Text style={[caption, { color: theme.text.muted }]}>
            {from} → {beatenThisWeek}
          </Text>
          <Text
            style={[
              hero,
              {
                color: theme.state.success,
                fontFamily: theme.fonts.display,
                marginTop: 4,
              },
            ]}
          >
            {beatenThisWeek}
          </Text>
          <Text style={[caption, { color: theme.text.secondary, marginTop: 4 }]}>
            cravings that didn&apos;t win
          </Text>
        </Animated.View>

        <Animated.View style={[styles.rest, restStyle]}>
          <Text
            style={[
              headline,
              { color: theme.text.primary, textAlign: 'center' },
            ]}
          >
            You stayed.
          </Text>
          <Text
            style={[
              body,
              {
                color: theme.text.secondary,
                textAlign: 'center',
                marginTop: 10,
                lineHeight: 24,
              },
            ]}
          >
            {why ?? 'That craving came and went. You stayed.'}
          </Text>

          <View style={styles.actions}>
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
          </View>
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
  burst: {
    marginBottom: 4,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 36,
  },
  rest: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 36,
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
