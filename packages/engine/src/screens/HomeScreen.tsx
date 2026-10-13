import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BreathingOrb } from '../components/BreathingOrb';
import { BottomNav, type NavTab } from '../components/BottomNav';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { ScorePlaque } from '../components/ScorePlaque';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { useAuthStore } from '../auth/useAuthStore';
import { pickDailyQuote } from '../data/format';
import { homeGreeting } from '../data/greeting';
import { useCravingStats, useDashboard } from '../data/hooks/useDashboard';
import { useProfile } from '../data/hooks/useProfile';
import { resolveFirstName } from '../data/profileMap';
import type { HealthTimelineItem } from '../data/types';
import { useFlowStore } from '../flow/useFlowStore';
import { FadeBlock } from '../motion/FadeBlock';
import { useOnboardingStore } from '../onboarding/useOnboardingStore';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

interface HomeScreenProps {
  onTabPress?: (tab: NavTab) => void;
  hideNav?: boolean;
}

export function HomeScreen({ onTabPress, hideNav }: HomeScreenProps) {
  const theme = useTheme();
  const config = useNicheConfig();
  const { caption, body, title } = useTypography();
  const startFight = useFlowStore((s) => s.startFight);
  const storedName = useOnboardingStore((s) => s.answers.name);
  const { data: profile } = useProfile();
  const authName = useAuthStore((s) => s.user?.name);
  const firstName = config.useMockApi
    ? resolveFirstName(storedName)
    : resolveFirstName(storedName, profile, authName);
  const { beatenThisWeek, totalBeaten, isLoading, isError } =
    useCravingStats();
  const { data: dashboard } = useDashboard();
  const [launching, setLaunching] = useState(false);

  const derived = dashboard?.derived;
  const daysFree = derived?.days_smoke_free ?? 0;
  const moneyReclaimed = derived?.money_reclaimed ?? 0;
  const currency = derived?.money_currency ?? 'INR';
  const waves = totalBeaten || beatenThisWeek;

  const currentMilestone = dashboard?.health_timeline?.find(
    (item: HealthTimelineItem) => item.status === 'current'
  );
  const insightText =
    currentMilestone?.description ?? pickDailyQuote(config.motivationQuotes);

  const showLoading = isLoading && !dashboard && !isError;
  const rideCaption =
    config.gameDurationSecs >= 60
      ? `${Math.round(config.gameDurationSecs / 60)} min`
      : `${config.gameDurationSecs}s`;
  const greeting = homeGreeting(firstName);

  const handleRide = () => {
    if (launching) return;
    setLaunching(true);
    setTimeout(() => {
      startFight();
    }, 380);
  };

  const ridePrompt = firstName
    ? `${firstName}, tap here and ride it out.`
    : 'Tap here and ride it out.';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: hideNav ? 'transparent' : theme.surface.canvas },
      ]}
    >
      {hideNav ? null : <OceanBackground />}
      {hideNav ? null : <AppHeader />}

      <View style={styles.content}>
        {showLoading ? (
          <View style={styles.hero}>
            <Text
              style={[
                caption,
                { color: theme.text.muted, marginBottom: 16, textAlign: 'center' },
              ]}
            >
              {greeting}
            </Text>
            <ActivityIndicator color={theme.accent.coral} size="large" />
            <Text
              style={[
                body,
                {
                  color: theme.text.secondary,
                  textAlign: 'center',
                  marginTop: 16,
                },
              ]}
            >
              Loading your tide…
            </Text>
            <GlowingButton
              label={config.primaryActionLabel}
              onPress={handleRide}
              style={{ marginTop: 28, width: '100%', maxWidth: 280 }}
            />
          </View>
        ) : (
          <>
            <FadeBlock delay={40} style={styles.hero}>
              <Text
                style={[
                  caption,
                  {
                    color: theme.text.secondary,
                    marginBottom: 10,
                    textAlign: 'center',
                    letterSpacing: 0.4,
                  },
                ]}
              >
                {greeting}
              </Text>
              <ScorePlaque
                days={daysFree}
                waves={waves}
                money={moneyReclaimed}
                currency={currency}
              />
            </FadeBlock>

            <FadeBlock delay={140} style={styles.cta}>
              <BreathingOrb
                label={config.primaryActionLabel}
                caption={rideCaption}
                onPress={handleRide}
                launching={launching}
              />
              <Text
                style={[
                  title,
                  {
                    color: theme.text.primary,
                    textAlign: 'center',
                    marginTop: 28,
                    maxWidth: 300,
                  },
                ]}
              >
                Feeling the pull? {ridePrompt}
              </Text>
            </FadeBlock>

            <FadeBlock delay={240} style={styles.whisper}>
              <Text
                style={[
                  caption,
                  {
                    color: theme.text.secondary,
                    textAlign: 'center',
                    lineHeight: 20,
                  },
                ]}
              >
                {insightText || 'The urge is loud. It is also temporary.'}
              </Text>
            </FadeBlock>
          </>
        )}
      </View>

      {hideNav || !onTabPress ? null : (
        <BottomNav active="home" onTabPress={onTabPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 108,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: 16,
  },
  cta: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -20,
  },
  whisper: {
    width: '100%',
    maxWidth: 300,
    paddingBottom: 12,
  },
});
