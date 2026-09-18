import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedCount } from './AnimatedCount';
import { formatMoney } from '../data/format';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

interface ScorePlaqueProps {
  days: number;
  waves: number;
  money: number;
  currency?: string;
}

/** Score tile — one filled white card, aqua headline number, two chips. */
export function ScorePlaque({
  days,
  waves,
  money,
  currency = 'INR',
}: ScorePlaqueProps) {
  const theme = useTheme();
  const { hero, label, caption } = useTypography();

  const waveCopy = waves === 1 ? '1 wave' : `${waves} waves`;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.tile,
          {
            backgroundColor: theme.surface.bright,
            borderRadius: theme.radius.xl,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <AnimatedCount
          value={days}
          style={[
            hero,
            {
              color: theme.accent.aqua,
              fontFamily: theme.fonts.display,
              fontWeight: '700',
            },
          ]}
        />
        <Text
          style={[
            label,
            {
              color: theme.text.secondary,
              marginTop: 4,
              letterSpacing: 1.2,
            },
          ]}
        >
          DAYS CLEAR
        </Text>
      </View>

      <View style={styles.chips}>
        <View
          style={[
            styles.chip,
            { backgroundColor: theme.accent.aqua },
          ]}
        >
          <Text style={[caption, styles.chipText, { color: theme.text.inverse }]}>
            {waveCopy}
          </Text>
        </View>
        {money > 0 ? (
          <View
            style={[
              styles.chip,
              { backgroundColor: theme.accent.coral },
            ]}
          >
            <Text style={[caption, styles.chipText, { color: theme.text.inverse }]}>
              {formatMoney(money, currency)} back
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  tile: {
    minWidth: 168,
    minHeight: 168,
    paddingHorizontal: 30,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
