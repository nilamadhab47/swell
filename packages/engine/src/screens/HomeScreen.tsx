import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { ArtEmblem, ART } from '../components/ArtEmblem';
import { BreathingOrb } from '../components/BreathingOrb';
import { BottomNav, type NavTab } from '../components/BottomNav';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { ScorePlaque } from '../components/ScorePlaque';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { pickDailyQuote } from '../data/format';
import { useCravingStats, useDashboard } from '../data/hooks/useDashboard';
import type { HealthTimelineItem } from '../data/types';
import { useFlowStore } from '../flow/useFlowStore';
import { FadeBlock } from '../motion/FadeBlock';
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
  const { beatenThisWeek, totalBeaten, isLoading, isFetching, isError, refetch } =
    useCravingStats();
  const { data: dashboard } = useDashboard();
  const [launching, setLaunching] = useState(false);

  const derived = dashboard?.derived;
  const daysFree = derived?.days_smoke_free ?? 0;
  const moneyReclaimed = derived?.money_reclaimed ?? 0;
  const currency = derived?.money_currency ?? 'INR';
  const waves = totalBeaten || beatenThisWeek;

  const currentMilestone = dashboard?.health_timeline.find(
    (item: HealthTimelineItem) => item.status === 'current'
  );
  const insightText =
    currentMilestone?.description ?? pickDailyQuote(config.motivationQuotes);

  const showLoading = isLoading && !dashboard;

  const handleRide = () => {
    if (launching) return;
    setLaunching(true);
    setTimeout(() => {
      startFight();
    }, 380);
  };

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
          <ActivityIndicator color={theme.accent.coral} size="large" />
        ) : isError && !dashboard ? (
          <View style={styles.hero}>
            <ArtEmblem source={ART.empty} size={180} rounded />
            <Text
              style={[
                body,
                {
                  color: theme.text.primary,
                  textAlign: 'center',
                  lineHeight: 22,
                  marginTop: 20,
                },
              ]}
            >
              Couldn&apos;t reach your stats. The craving loop still works.
            </Text>
            <GlowingButton
              label="Try again"
              onPress={() => {
                void refetch();
              }}
              style={{ marginTop: 24, width: '100%', maxWidth: 280 }}
            />
          </View>
        ) : (
          <>
            <FadeBlock delay={40} style={styles.hero}>
              <ScorePlaque
                days={daysFree}
                waves={waves}
                money={moneyReclaimed}
                currency={currency}
              />
              {isFetching && !isLoading ? (
                <Text
                  style={[
                    caption,
                    { color: theme.text.muted, marginTop: 10 },
                  ]}
                >
                  Catching up…
                </Text>
              ) : null}
            </FadeBlock>

            <FadeBlock delay={140} style={styles.cta}>
              <BreathingOrb
                label={config.primaryActionLabel}
                caption="3 min"
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
                Feeling the pull? Tap here and ride it out.
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
