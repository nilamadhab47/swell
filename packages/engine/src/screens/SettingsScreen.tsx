import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../components/AppHeader';
import { ArtEmblem, ART } from '../components/ArtEmblem';
import { BottomNav, type NavTab } from '../components/BottomNav';
import { DevScreenMenu, type DevScreenTarget } from '../components/DevScreenMenu';
import { GlassCard } from '../components/GlassCard';
import { OceanBackground } from '../components/OceanBackground';
import { SettingsRow } from '../components/SettingsRow';
import { useAuthStore } from '../auth/useAuthStore';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { useFlowStore } from '../flow/useFlowStore';
import { useLatestNote } from '../data/hooks/useCravings';
import { FadeBlock } from '../motion/FadeBlock';
import { useOnboardingStore } from '../onboarding/useOnboardingStore';
import {
  costSettingsTitle,
  habitLabel,
  parseHabit,
  unitsSettingsTitle,
} from '../onboarding/habit';
import { useColorSchemePreference } from '../theme/ThemeProvider';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

interface SettingsScreenProps {
  onTabPress?: (tab: NavTab) => void;
  onDevJump?: (target: DevScreenTarget) => void;
  onDevReset?: () => void;
  hideNav?: boolean;
}

function formatQuitDate(iso: string | null): string {
  if (!iso) return 'Not set yet';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not set yet';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatNoteTime(savedAt: number): string {
  return new Date(savedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function SettingsScreen({
  onTabPress,
  onDevJump,
  onDevReset,
  hideNav,
}: SettingsScreenProps) {
  const theme = useTheme();
  const config = useNicheConfig();
  const { headline, body, label } = useTypography();
  const answers = useOnboardingStore((s) => s.answers);
  const replay = useOnboardingStore((s) => s.replay);
  const lastReflection = useFlowStore((s) => s.lastReflection);
  const latestNote = useLatestNote();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const { preference, cycle } = useColorSchemePreference();
  const appearanceLabel =
    preference === 'system' ? 'System' : preference === 'dark' ? 'Dark' : 'Light';

  const cigs = answers.cigs_per_day.trim();
  const cost = answers.cost_per_pack.trim();
  const reason = answers.reason.trim();
  const habit = parseHabit(answers.habit);

  return (
    <View style={[styles.container, { backgroundColor: hideNav ? 'transparent' : theme.surface.canvas }]}>
      {hideNav ? null : <OceanBackground />}
      {hideNav ? null : <AppHeader />}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeBlock delay={40}>
          <Text style={[headline, { color: theme.text.primary }]}>
            This is yours
          </Text>
          <Text
            style={[
              body,
              { color: theme.text.secondary, marginTop: 8, lineHeight: 22 },
            ]}
          >
            A quiet place for the story you're writing. Nothing here is medical.
            It's just you, keeping score.
          </Text>
        </FadeBlock>

        <FadeBlock delay={100}>
          <GlassCard style={styles.card}>
            <Text style={[label, { color: theme.text.secondary }]}>
              YOUR WHY
            </Text>
            <SettingsRow
              title="The reason"
              subtitle={reason || "You haven't named it yet — that's okay."}
            />
            <SettingsRow
              title="Putting down"
              value={habitLabel(habit)}
            />
            <SettingsRow
              title={unitsSettingsTitle(habit)}
              value={cigs ? cigs : '—'}
            />
            <SettingsRow
              title={costSettingsTitle(habit)}
              value={cost ? `₹${cost}` : '—'}
            />
            <SettingsRow
              title="This chapter started"
              value={formatQuitDate(answers.quit_date)}
            />
            <SettingsRow
              title="Rewrite these answers"
              subtitle="Start the welcome flow again. Your wins stay."
              value="Replay"
              onPress={replay}
            />
          </GlassCard>
        </FadeBlock>

        <FadeBlock delay={160}>
          <GlassCard style={styles.card}>
            <Text style={[label, { color: theme.text.secondary }]}>
              LAST NOTE
            </Text>
            {latestNote?.trigger_note ||
            latestNote?.transcript ||
            lastReflection?.triggerNote ? (
              <SettingsRow
                title={
                  latestNote?.trigger_note ||
                  latestNote?.transcript ||
                  lastReflection?.triggerNote ||
                  ''
                }
                subtitle={`Caught on ${formatNoteTime(
                  latestNote?.created_at
                    ? new Date(latestNote.created_at).getTime()
                    : lastReflection?.savedAt ?? Date.now()
                )}`}
              />
            ) : (
              <View style={styles.emptyNote}>
                <ArtEmblem source={ART.empty} size={112} delay={200} rounded />
                <Text
                  style={[
                    body,
                    {
                      color: theme.text.primary,
                      fontWeight: '600',
                      marginTop: 12,
                    },
                  ]}
                >
                  Nothing saved yet
                </Text>
                <Text
                  style={[
                    body,
                    {
                      color: theme.text.secondary,
                      textAlign: 'center',
                      marginTop: 4,
                      lineHeight: 20,
                    },
                  ]}
                >
                  After a win, leave a line. Patterns show up when you&apos;re
                  ready.
                </Text>
              </View>
            )}
          </GlassCard>
        </FadeBlock>

        <FadeBlock delay={220}>
          <GlassCard style={styles.card}>
            <Text style={[label, { color: theme.text.secondary }]}>
              RITUAL
            </Text>
            <SettingsRow
              title="Craving reminders"
              subtitle="A quiet nudge when the usual hour hits."
              value="Soon"
              muted
            />
            <SettingsRow
              title="Appearance"
              subtitle="Follow the phone, or lock a tide."
              value={appearanceLabel}
              onPress={cycle}
            />
            {config.useMockApi ? (
              <SettingsRow
                title="Sign-in"
                subtitle="Demo mode — API calls are off."
                value="Off"
                muted
              />
            ) : (
              <>
                <SettingsRow
                  title="Signed in"
                  subtitle={
                    user?.phone ??
                    user?.email ??
                    'Your session is on this phone.'
                  }
                />
                <SettingsRow
                  title="Sign out"
                  subtitle="Wins stay on the server. This phone forgets the session."
                  value="Leave"
                  onPress={() => {
                    void logout(config.appId).then(() => {
                      replay();
                      queryClient.clear();
                    });
                  }}
                />
              </>
            )}
          </GlassCard>
        </FadeBlock>

        <FadeBlock delay={280}>
          <GlassCard style={styles.card}>
            <Text style={[label, { color: theme.text.secondary }]}>
              ABOUT
            </Text>
            <SettingsRow title={config.brand.name} subtitle={config.brand.tagline} />
            {config.useMockApi ? (
              <SettingsRow
                title="Demo numbers"
                subtitle="These wins are local mock data while we build."
                value="On"
                muted
              />
            ) : (
              <SettingsRow
                title="Live API"
                subtitle="Talking to the Swell backend. Stats come from your account."
                value="On"
              />
            )}
          </GlassCard>
        </FadeBlock>

        {__DEV__ && onDevJump && onDevReset ? (
          <FadeBlock delay={320}>
            <GlassCard style={styles.card}>
              <DevScreenMenu onJump={onDevJump} onReset={onDevReset} />
            </GlassCard>
          </FadeBlock>
        ) : null}
      </ScrollView>

      {hideNav || !onTabPress ? null : (
        <BottomNav active="settings" onTabPress={onTabPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 8,
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
    marginTop: 20,
    width: '100%',
  },
  emptyNote: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
});
