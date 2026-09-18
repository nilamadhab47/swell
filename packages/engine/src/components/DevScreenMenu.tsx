import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NavTab } from './BottomNav';
import type { FlowState } from '../flow/types';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

export type DevScreenTarget = NavTab | FlowState | 'onboarding';

const SCREENS: { id: DevScreenTarget; label: string; group: 'tabs' | 'flow' | 'setup' }[] = [
  { id: 'home', label: 'Home', group: 'tabs' },
  { id: 'progress', label: 'Progress', group: 'tabs' },
  { id: 'settings', label: 'Settings', group: 'tabs' },
  { id: 'onboarding', label: 'Onboarding', group: 'setup' },
  { id: 'game_select', label: 'Game Select', group: 'flow' },
  { id: 'game', label: 'Block Stack Game', group: 'flow' },
  { id: 'victory', label: 'Victory', group: 'flow' },
  { id: 'reflect', label: 'Reflect (note)', group: 'flow' },
];

interface DevScreenMenuProps {
  onJump: (target: DevScreenTarget) => void;
  onReset: () => void;
}

/** Dev-only gallery to open any screen without walking the user flow. */
export function DevScreenMenu({ onJump, onReset }: DevScreenMenuProps) {
  const theme = useTheme();
  const { label, body } = useTypography();

  if (!__DEV__) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[label, { color: theme.accent.coral, marginBottom: 8 }]}>
        DEV — SCREEN GALLERY
      </Text>
      <Text style={[body, { color: theme.text.secondary, marginBottom: 16 }]}>
        Tap any screen to preview it. Flow screens exit via Skip / back.
      </Text>

      <Text style={[label, styles.groupLabel, { color: theme.text.secondary }]}>
        Tabs
      </Text>
      <View style={styles.grid}>
        {SCREENS.filter((s) => s.group === 'tabs').map((screen) => (
          <DevButton
            key={screen.id}
            label={screen.label}
            onPress={() => onJump(screen.id)}
          />
        ))}
      </View>

      <Text
        style={[
          label,
          styles.groupLabel,
          { color: theme.text.secondary, marginTop: 16 },
        ]}
      >
        Setup
      </Text>
      <View style={styles.grid}>
        {SCREENS.filter((s) => s.group === 'setup').map((screen) => (
          <DevButton
            key={screen.id}
            label={screen.label}
            onPress={() => onJump(screen.id)}
          />
        ))}
      </View>

      <Text
        style={[
          label,
          styles.groupLabel,
          { color: theme.text.secondary, marginTop: 16 },
        ]}
      >
        Craving flow
      </Text>
      <View style={styles.grid}>
        {SCREENS.filter((s) => s.group === 'flow').map((screen) => (
          <DevButton
            key={screen.id}
            label={screen.label}
            onPress={() => onJump(screen.id)}
          />
        ))}
      </View>

      <Pressable onPress={onReset} style={styles.resetBtn}>
        <Text style={[body, { color: theme.text.secondary }]}>
          Reset flow → Home
        </Text>
      </Pressable>
    </View>
  );
}

function DevButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  const { body } = useTypography();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: theme.surface.bright,
          borderColor: theme.border.subtle,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[body, { color: theme.text.primary, fontSize: 13 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  groupLabel: {
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  resetBtn: {
    marginTop: 20,
    paddingVertical: 8,
    alignSelf: 'center',
  },
});
