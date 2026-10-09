import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { ArtEmblem, ART } from '../components/ArtEmblem';
import { BottomNav, type NavTab } from '../components/BottomNav';
import { DevScreenMenu, type DevScreenTarget } from '../components/DevScreenMenu';
import { GlassCard } from '../components/GlassCard';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { SettingsRow } from '../components/SettingsRow';
import { useAuthStore } from '../auth/useAuthStore';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { updateProfile } from '../data/api';
import { useLatestNote } from '../data/hooks/useCravings';
import { profileQueryKey, useProfile } from '../data/hooks/useProfile';
import { nameAgePatch, parseAgeInput, resolveDisplayName } from '../data/profileMap';
import { openLegalPage, openPlayListing, PRIVACY_URL, TERMS_URL } from '../legal/links';
import { useFlowStore } from '../flow/useFlowStore';
import { useReminderPreference } from '../hooks/useReminderPreference';
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

function extrasAge(profile: { extras?: Record<string, unknown> } | undefined): number | undefined {
  const raw = profile?.extras?.age;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function displayAge(value: string | number | undefined | null): string {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? String(Math.round(n)) : 'Not set';
}

export function SettingsScreen({
  onTabPress,
  onDevJump,
  onDevReset,
  hideNav,
}: SettingsScreenProps) {
  const theme = useTheme();
  const config = useNicheConfig();
  const { headline, body, title, label, caption } = useTypography();
  const insets = useSafeAreaInsets();
  const answers = useOnboardingStore((s) => s.answers);
  const patchAnswers = useOnboardingStore((s) => s.patchAnswers);
  const replay = useOnboardingStore((s) => s.replay);
  const lastReflection = useFlowStore((s) => s.lastReflection);
  const latestNote = useLatestNote();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const remindersOn = useReminderPreference((s) => s.enabled);
  const setRemindersOn = useReminderPreference((s) => s.setEnabled);
  const { preference, cycle } = useColorSchemePreference();
  const appearanceLabel =
    preference === 'system' ? 'System' : preference === 'dark' ? 'Dark' : 'Light';

  const cigs = answers.cigs_per_day.trim();
  const cost = answers.cost_per_pack.trim();
  const reason = answers.reason.trim();
  const habit = parseHabit(answers.habit);
  const userName = resolveDisplayName(answers.name, profile, user?.name);
  const ageLabel = displayAge(answers.age || profile?.age || extrasAge(profile));

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = useCallback(() => {
    setEditName(userName);
    const ageSource = answers.age || profile?.age || extrasAge(profile);
    const parsed = Number(ageSource);
    setEditAge(Number.isFinite(parsed) && parsed > 0 ? String(Math.round(parsed)) : '');
    setEditOpen(true);
  }, [answers.age, profile, userName]);

  const saveProfile = useCallback(async () => {
    const nextName = editName.trim();
    const parsed = parseAgeInput(editAge);
    if (!nextName) {
      Alert.alert('Name needed', 'Add a first name so we can greet you.');
      return;
    }
    if (!parsed.ok) {
      Alert.alert('Age looks off', 'Leave it blank, or enter a number between 13 and 120.');
      return;
    }
    const nextAge = parsed.age;
    const previous = { name: answers.name, age: answers.age };
    setSaving(true);
    patchAnswers({
      name: nextName,
      age: nextAge != null ? String(nextAge) : '',
    });
    try {
      if (!config.useMockApi) {
        await updateProfile(
          config.appId,
          nameAgePatch(profile, nextName, nextAge, answers),
        );
        await queryClient.invalidateQueries({
          queryKey: profileQueryKey(config.appId),
        });
      }
      setEditOpen(false);
    } catch {
      patchAnswers(previous);
      Alert.alert(
        'Couldn’t save',
        'Check your connection and try again. Your name was not changed.',
      );
    } finally {
      setSaving(false);
    }
  }, [
    answers,
    config.appId,
    config.useMockApi,
    editAge,
    editName,
    patchAnswers,
    profile,
    queryClient,
  ]);

  const toggleReminders = useCallback(() => {
    const next = !remindersOn;
    Alert.alert(
      next ? 'Turn reminders on?' : 'Turn reminders off?',
      next
        ? 'We’ll nudge you when a craving window is likely.'
        : 'You won’t get craving nudges until you turn this back on.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: next ? 'Turn on' : 'Turn off',
          onPress: () => {
            void setRemindersOn(next);
          },
        },
      ],
    );
  }, [remindersOn, setRemindersOn]);

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
            {userName ? `${userName}'s story` : 'This is yours'}
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
              YOU
            </Text>
            <SettingsRow
              title="Name"
              subtitle="Used for your greeting. Not shown to anyone else."
              value={userName || 'Not set'}
              onPress={openEdit}
            />
            <SettingsRow
              title="Age"
              value={ageLabel}
              onPress={openEdit}
            />
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
              subtitle="One or two quiet notes a day, if you allow alerts."
              value={remindersOn ? 'On' : 'Off'}
              onPress={toggleReminders}
            />
            <SettingsRow
              title="Appearance"
              subtitle="Follow the phone, or lock a tide."
              value={appearanceLabel}
              onPress={cycle}
            />
          </GlassCard>
        </FadeBlock>

        {config.useMockApi ? null : (
          <FadeBlock delay={250}>
            <GlassCard style={styles.card}>
              <Text style={[label, { color: theme.text.secondary }]}>
                ACCOUNT
              </Text>
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
              <SettingsRow
                title="Delete account"
                subtitle="Erase this account, wins, notes, and reminders. Cannot be undone."
                value="Delete"
                onPress={() => {
                  Alert.alert(
                    'Delete your account?',
                    'This permanently erases your sign-in, wins, notes, and reminder tokens. You can create a new account later, but this one is gone.',
                    [
                      { text: 'Keep it', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          Alert.alert(
                            'Really delete?',
                            'Last chance. This cannot be undone.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete forever',
                                style: 'destructive',
                                onPress: () => {
                                  void deleteAccount(config.appId)
                                    .then(() => {
                                      replay();
                                      queryClient.clear();
                                    })
                                    .catch((err: unknown) => {
                                      const message =
                                        err instanceof Error
                                          ? err.message
                                          : 'Could not delete the account. Try again.';
                                      Alert.alert('Not deleted', message);
                                    });
                                },
                              },
                            ],
                          );
                        },
                      },
                    ],
                  );
                }}
              />
            </GlassCard>
          </FadeBlock>
        )}

        <FadeBlock delay={280}>
          <GlassCard style={styles.card}>
            <Text style={[label, { color: theme.text.secondary }]}>
              ABOUT
            </Text>
            <SettingsRow title={config.brand.name} subtitle={config.brand.tagline} />
            <SettingsRow
              title="Privacy"
              subtitle="How we use your account and craving data."
              value="Open"
              onPress={() => {
                void openLegalPage(PRIVACY_URL);
              }}
            />
            <SettingsRow
              title="Terms"
              subtitle="What using Swell means."
              value="Open"
              onPress={() => {
                void openLegalPage(TERMS_URL);
              }}
            />
            <SettingsRow
              title="Rate Swell"
              subtitle="Opens the Play Store listing."
              value="Play"
              onPress={() => {
                void openPlayListing();
              }}
            />
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

      <Modal
        visible={editOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setEditOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrap}
        >
          <Pressable style={styles.modalScrim} onPress={() => setEditOpen(false)} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.surface.raised,
                borderColor: theme.border.subtle,
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            <Text style={[title, { color: theme.text.primary, marginBottom: 6 }]}>
              Name & age
            </Text>
            <Text
              style={[body, { color: theme.text.secondary, marginBottom: 18 }]}
            >
              Used for your greeting. Not shown to anyone else.
            </Text>
            <Text style={[caption, { color: theme.text.muted, marginBottom: 6 }]}>
              First name
            </Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              autoCapitalize="words"
              placeholder="Your name"
              placeholderTextColor={theme.text.muted}
              style={[
                body,
                styles.input,
                {
                  color: theme.text.primary,
                  borderColor: theme.border.subtle,
                  backgroundColor: theme.surface.canvas,
                },
              ]}
            />
            <Text
              style={[
                caption,
                { color: theme.text.muted, marginBottom: 6, marginTop: 14 },
              ]}
            >
              Age
            </Text>
            <TextInput
              value={editAge}
              onChangeText={setEditAge}
              keyboardType="number-pad"
              placeholder="Optional"
              placeholderTextColor={theme.text.muted}
              style={[
                body,
                styles.input,
                {
                  color: theme.text.primary,
                  borderColor: theme.border.subtle,
                  backgroundColor: theme.surface.canvas,
                },
              ]}
            />
            <GlowingButton
              label={saving ? 'Saving…' : 'Save'}
              onPress={() => {
                void saveProfile();
              }}
              disabled={saving}
              style={{ marginTop: 22 }}
            />
            <Pressable
              onPress={() => setEditOpen(false)}
              style={{ marginTop: 14, alignItems: 'center' }}
            >
              <Text style={[caption, { color: theme.text.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 18, 32, 0.55)',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
