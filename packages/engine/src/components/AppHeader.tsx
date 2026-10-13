import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNicheConfig } from '../config/NicheConfigProvider';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

interface AppHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

/** Minimal header: brand name in plain text, optional back button. */
export function AppHeader({ onBack, showBack = false }: AppHeaderProps) {
  const theme = useTheme();
  const config = useNicheConfig();
  const { title } = useTypography();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {showBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.iconBtn}>
          <Text style={{ color: theme.text.secondary, fontSize: 22 }}>
            ←
          </Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text
        style={[
          title,
          { color: theme.text.primary, fontWeight: '700' },
        ]}
      >
        {config.brand.name}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 40,
  },
});
