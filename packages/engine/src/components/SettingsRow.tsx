import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  muted?: boolean;
}

export function SettingsRow({
  title,
  subtitle,
  value,
  onPress,
  muted,
}: SettingsRowProps) {
  const theme = useTheme();
  const { body, label } = useTypography();

  const content = (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[body, { color: theme.text.primary }]}>{title}</Text>
        {subtitle ? (
          <Text
            style={[
              label,
              {
                color: theme.text.secondary,
                marginTop: 4,
                lineHeight: 18,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          style={[
            label,
            {
              color: muted ? theme.text.secondary : theme.accent.coral,
              marginLeft: 12,
            },
          ]}
        >
          {value}
        </Text>
      ) : null}
    </View>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.wrap,
          { borderBottomColor: theme.border.subtle },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.wrap,
        {
          borderBottomColor: theme.border.subtle,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
  },
});
