import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

interface StatChipProps {
  label: string;
  icon?: string;
}

export function StatChip({ label, icon }: StatChipProps) {
  const theme = useTheme();
  const { label: labelStyle } = useTypography();

  return (
    <GlassCard style={styles.chip}>
      <View style={styles.row}>
        {icon && (
          <Text style={[styles.icon, { color: theme.text.secondary }]}>
            {icon}
          </Text>
        )}
        <Text style={[labelStyle, { color: theme.text.primary, textTransform: 'none' }]}>
          {label}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 14,
  },
});
