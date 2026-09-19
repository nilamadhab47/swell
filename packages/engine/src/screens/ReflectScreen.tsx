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
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { patchCraving } from '../data/api';
import { cravingsQueryKey } from '../data/hooks/useCravings';
import { useFlowStore } from '../flow/useFlowStore';
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

  const handleSave = () => {
    const text = note.trim();
    if (!text) return;
    saveReflection({
      triggerNote: text,
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

  const canSave = note.trim().length > 0;

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
