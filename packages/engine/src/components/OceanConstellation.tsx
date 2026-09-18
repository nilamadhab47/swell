import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

const MAX_STARS = 50;

/** Deterministic scatter — same layout every render. */
const STAR_LAYOUT = Array.from({ length: MAX_STARS }, (_, i) => ({
  left: `${8 + ((i * 41) % 84)}%`,
  top: `${6 + ((i * 29) % 88)}%`,
  size: 3 + (i % 3),
  opacity: 0.45 + (i % 5) * 0.1,
}));

interface OceanConstellationProps {
  totalBeaten: number;
}

/**
 * Each craving beaten lights another star. Caps at 50 visible dots;
 * overflow shown as a quiet "+N more" label.
 */
export function OceanConstellation({ totalBeaten }: OceanConstellationProps) {
  const theme = useTheme();
  const { label } = useTypography();

  const litCount = Math.min(totalBeaten, MAX_STARS);
  const overflow = totalBeaten > MAX_STARS ? totalBeaten - MAX_STARS : 0;
  const fillRatio = litCount / MAX_STARS;

  const stars = useMemo(() => STAR_LAYOUT.slice(0, MAX_STARS), []);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.sky,
          {
            backgroundColor: theme.signature.tideDeep,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        {stars.map((star, index) => {
          const isLit = index < litCount;
          return (
            <View
              key={index}
              style={[
                styles.star,
                {
                  left: star.left as `${number}%`,
                  top: star.top as `${number}%`,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                  backgroundColor: isLit
                    ? theme.accent.aqua
                    : theme.text.secondary,
                  opacity: isLit ? star.opacity : 0.12,
                },
              ]}
            />
          );
        })}
        <View
          style={[
            styles.horizon,
            { backgroundColor: theme.accent.aqua, opacity: 0.18 + fillRatio * 0.35 },
          ]}
        />
      </View>
      <Text style={[label, styles.caption, { color: theme.text.secondary }]}>
        {totalBeaten === 0
          ? 'Beat a craving to light your ocean'
          : overflow > 0
            ? `${litCount} stars lit · +${overflow} more`
            : `${litCount} star${litCount === 1 ? '' : 's'} in your ocean`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  sky: {
    height: 200,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    position: 'relative',
  },
  star: {
    position: 'absolute',
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
  },
  caption: {
    textAlign: 'center',
    marginTop: 10,
  },
});
