import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { ArtEmblem, ART } from '../components/ArtEmblem';
import { BottomNav, type NavTab } from '../components/BottomNav';
import {
  HealthTimelineFromConfig,
  HealthTimelineList,
} from '../components/HealthTimelineList';
import { OceanBackground } from '../components/OceanBackground';
import { LungsVisual } from '../components/LungsVisual';
import { OceanConstellation } from '../components/OceanConstellation';
import { useNicheConfig } from '../config/NicheConfigProvider';
import {
  buildProgressInsight,
  formatDays,
  formatMoney,
  formatTimeSaved,
  moneyInRealTerms,
} from '../data/format';
import { useCravingStats, useDashboard } from '../data/hooks/useDashboard';
import { FadeBlock } from '../motion/FadeBlock';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

interface ProgressScreenProps {
  onTabPress?: (tab: NavTab) => void;
  hideNav?: boolean;
}

export function ProgressScreen({ onTabPress, hideNav }: ProgressScreenProps) {
  const theme = useTheme();
  const config = useNicheConfig();
  const { headline, body, label } = useTypography();
  const { data: dashboard, isLoading } = useDashboard();
  const { beatenThisWeek, totalBeaten } = useCravingStats();

  const derived = dashboard?.derived;
  const money = config.useMockApi
    ? (derived?.money_reclaimed ?? config.mockSeed?.moneyReclaimed ?? 0)
    : (derived?.money_reclaimed ?? 0);
  const currency = derived?.money_currency ?? 'INR';
  const daysFree = config.useMockApi
    ? (derived?.days_smoke_free ?? config.mockSeed?.daysSmokeFree ?? 0)
    : (derived?.days_smoke_free ?? 0);
  const timeSaved = derived?.time_saved_minutes ?? 0;
  const longestStreak = config.useMockApi
    ? (dashboard?.longest_streak_days ?? config.mockSeed?.longestStreakDays ?? 0)
    : (dashboard?.longest_streak_days ?? 0);

  const realTerms = moneyInRealTerms(money, currency);
  const timeline = dashboard?.health_timeline ?? [];
  const currentMilestone = timeline.find((item) => item.status === 'current');
  const insight = buildProgressInsight(currentMilestone?.label, beatenThisWeek);

  return (
    <View style={[styles.container, { backgroundColor: hideNav ? 'transparent' : theme.surface.canvas }]}>
      {hideNav ? null : <OceanBackground />}
      {hideNav ? null : <AppHeader />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeBlock delay={40}>
          <Text style={[label, { color: theme.text.secondary }]}>
            WHAT YOU'VE WON
          </Text>
          <Text
            style={[
              headline,
              { color: theme.text.primary, marginTop: 4, marginBottom: 24 },
            ]}
          >
            {formatDays(daysFree)} clear
          </Text>
        </FadeBlock>

        {isLoading && !dashboard ? (
          <Text style={[body, { color: theme.text.secondary }]}>
            Gathering your wins…
          </Text>
        ) : (
          <>
            <FadeBlock delay={80}>
              <LungsVisual daysFree={daysFree} />
            </FadeBlock>

            <FadeBlock delay={100} style={styles.moneyHero}>
              <ArtEmblem source={ART.money} size={104} delay={120} />
              <Text style={[label, { color: theme.text.secondary, marginTop: 4 }]}>
                Money that&apos;s yours again
              </Text>
              <Text
                style={[
                  styles.moneyAmount,
                  {
                    color: theme.accent.aqua,
                    fontFamily: theme.fonts.display,
                  },
                ]}
              >
                {formatMoney(money, currency)}
              </Text>
              {realTerms ? (
                <Text
                  style={[
                    body,
                    { color: theme.text.secondary, marginTop: 6 },
                  ]}
                >
                  {realTerms}
                </Text>
              ) : null}
            </FadeBlock>

            <FadeBlock delay={160}>
              <OceanConstellation totalBeaten={totalBeaten} />
            </FadeBlock>

            <FadeBlock delay={200} style={styles.statsRow}>
              <View style={styles.statBare}>
                <Text style={[label, { color: theme.text.secondary }]}>
                  Waves ridden
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: theme.text.primary, fontFamily: theme.fonts.display },
                  ]}
                >
                  {totalBeaten}
                </Text>
              </View>
              <View style={styles.statBare}>
                <Text style={[label, { color: theme.text.secondary }]}>
                  Hours back
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: theme.text.primary, fontFamily: theme.fonts.display },
                  ]}
                >
                  {formatTimeSaved(timeSaved)}
                </Text>
              </View>
            </FadeBlock>

            {longestStreak > 0 ? (
              <FadeBlock delay={240} style={styles.streakRow}>
                <ArtEmblem source={ART.streak} size={64} delay={260} />
                <Text
                  style={[
                    body,
                    {
                      flex: 1,
                      color: theme.text.secondary,
                      lineHeight: 22,
                    },
                  ]}
                >
                  Longest quiet:{' '}
                  <Text style={{ color: theme.state.success, fontWeight: '600' }}>
                    {formatDays(longestStreak)}
                  </Text>
                  . That&apos;s a record worth keeping.
                </Text>
              </FadeBlock>
            ) : null}

            <FadeBlock delay={280} style={styles.section}>
              <View style={styles.sectionHead}>
                <ArtEmblem source={ART.milestone} size={56} delay={300} />
                <Text style={[label, { color: theme.text.secondary }]}>
                  Your body, quietly catching up
                </Text>
              </View>
              {timeline.length > 0 ? (
                <HealthTimelineList items={timeline} />
              ) : (
                <HealthTimelineFromConfig items={config.healthTimeline} />
              )}
            </FadeBlock>

            <FadeBlock delay={320}>
              <Text
                style={[
                  body,
                  {
                    color: theme.text.secondary,
                    lineHeight: 22,
                    marginBottom: 8,
                  },
                ]}
              >
                {insight}
              </Text>
            </FadeBlock>
          </>
        )}
      </ScrollView>

      {hideNav || !onTabPress ? null : (
        <BottomNav active="progress" onTabPress={onTabPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  moneyHero: {
    paddingVertical: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  moneyAmount: {
    fontSize: 52,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  statBare: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 6,
  },
  section: {
    marginBottom: 16,
  },
});
