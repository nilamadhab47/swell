import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { patchCraving } from '../data/api';
import { cravingsQueryKey } from '../data/hooks/useCravings';
import { useFlowStore } from '../flow/useFlowStore';
import { formatElapsed, useVoiceNote } from '../hooks/useVoiceNote';
import { maybeShowPostVictoryAd, useMonetization } from '../monetization';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

export function ReflectScreen() {
  const theme = useTheme();
  const config = useNicheConfig();
  const { headline, body, label } = useTypography();
  const goToVictory = useFlowStore((s) => s.goToVictory);
  const saveReflection = useFlowStore((s) => s.saveReflection);
  const lastCravingId = useFlowStore((s) => s.lastCravingId);
  const reset = useFlowStore((s) => s.reset);
  const { ads } = useMonetization();
  const queryClient = useQueryClient();

  const [note, setNote] = useState('');
  const voice = useVoiceNote();

  const isRecording = voice.state === 'recording';
  const isTranscribing = voice.state === 'transcribing';

  const handleToggleVoice = async () => {
    if (isRecording) {
      const transcript = await voice.stop();
      setNote((current) => current.trim() || transcript);
      return;
    }
    await voice.start();
  };

  const handleSave = () => {
    if (isRecording || isTranscribing) return;
    const text = note.trim();
    if (!text && !voice.uri) return;
    saveReflection({
      triggerNote: text,
      voiceNoteUri: voice.uri ?? undefined,
      transcript: text || undefined,
    });
    void maybeShowPostVictoryAd(ads);
    if (config.useMockApi || !lastCravingId) return;
    void patchCraving(config.appId, lastCravingId, {
      trigger_note: text || undefined,
      transcript: text || undefined,
    })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: cravingsQueryKey(config.appId),
        })
      )
      .catch(() => {
        // Note is still kept locally if the patch misses.
      });
  };

  const canSave = note.trim().length > 0 || Boolean(voice.uri);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />
      <AppHeader showBack onBack={goToVictory} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={[label, { color: theme.text.secondary }]}>
            OPTIONAL
          </Text>
          <Text
            style={[headline, { color: theme.text.primary, marginTop: 8 }]}
          >
            Name it so it loses its teeth.
          </Text>
          <Text
            style={[
              body,
              {
                color: theme.text.secondary,
                marginTop: 8,
                lineHeight: 22,
              },
            ]}
          >
            Coffee? Stress? After lunch? A few words now. Future-you will see
            the pattern.
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="After lunch. Stressed. That second coffee…"
            placeholderTextColor={theme.text.secondary}
            multiline
            style={[
              styles.input,
              {
                color: theme.text.primary,
                borderColor: theme.border.subtle,
                backgroundColor: theme.surface.glass,
                fontFamily: theme.fonts.body,
              },
            ]}
          />

          <GlassCard style={styles.voiceCard}>
            <Text style={[label, { color: theme.text.secondary }]}>
              Voice note
            </Text>
            <Pressable
              onPress={handleToggleVoice}
              disabled={isTranscribing}
              style={[
                styles.mic,
                {
                  backgroundColor: isRecording
                    ? theme.accent.coral
                    : theme.surface.bright,
                  borderColor: isRecording
                    ? theme.accent.coral
                    : theme.border.subtle,
                  opacity: isTranscribing ? 0.6 : 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 28,
                  color: isRecording
                    ? theme.text.inverse
                    : theme.text.primary,
                }}
              >
                {isRecording ? '■' : '●'}
              </Text>
            </Pressable>
            <Text
              style={[
                body,
                {
                  color: theme.text.secondary,
                  marginTop: 12,
                  textAlign: 'center',
                },
              ]}
            >
              {isTranscribing
                ? 'Transcribing…'
                : isRecording
                  ? `Recording  ${formatElapsed(voice.elapsedMs)}`
                  : voice.uri
                    ? 'Voice saved. Tweak the words above if you want.'
                    : 'Tap to talk it out. We’ll turn it into words.'}
            </Text>
          </GlassCard>

          <View style={styles.footer}>
            <GlowingButton
              label="Keep this one"
              onPress={handleSave}
              style={[styles.saveBtn, !canSave && styles.saveDisabled]}
            />
            <Pressable
              onPress={() => {
                void maybeShowPostVictoryAd(ads).then(reset);
              }}
              style={styles.skip}
              hitSlop={8}
            >
              <Text style={[body, { color: theme.text.secondary }]}>
                Skip — this win still counts
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  input: {
    marginTop: 24,
    minHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  voiceCard: {
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  mic: {
    marginTop: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 48,
    alignItems: 'center',
    gap: 12,
  },
  saveBtn: {
    width: '100%',
  },
  saveDisabled: {
    opacity: 0.45,
  },
  skip: {
    paddingVertical: 8,
  },
});
