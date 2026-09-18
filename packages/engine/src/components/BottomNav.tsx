import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas, Circle, Path } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme/useTheme';
import { useTypography } from '../theme/useTypography';

export type NavTab = 'home' | 'progress' | 'settings';

interface BottomNavProps {
  active: NavTab;
  onTabPress: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'progress', label: 'Wins' },
  { id: 'settings', label: 'You' },
];

const SPRING = { damping: 20, stiffness: 220, mass: 0.7 } as const;
const ICON = 22;

function NavGlyph({
  id,
  color,
}: {
  id: NavTab;
  color: string;
}) {
  if (id === 'home') {
    return (
      <Canvas style={styles.icon}>
        <Path
          path="M 2 15 C 6 8, 9 20, 11.5 13 C 14 6, 17 18, 20 11"
          style="stroke"
          strokeWidth={1.6}
          color={color}
          strokeCap="round"
          strokeJoin="round"
        />
      </Canvas>
    );
  }
  if (id === 'progress') {
    return (
      <Canvas style={styles.icon}>
        <Path
          path="M 3 17 L 8 12 L 12 14 L 19 6"
          style="stroke"
          strokeWidth={1.6}
          color={color}
          strokeCap="round"
          strokeJoin="round"
        />
        <Circle cx={19} cy={6} r={1.6} color={color} />
      </Canvas>
    );
  }
  return (
    <Canvas style={styles.icon}>
      <Circle
        cx={11}
        cy={8}
        r={3.2}
        style="stroke"
        strokeWidth={1.6}
        color={color}
      />
      <Path
        path="M 5 18 C 5 14, 17 14, 17 18"
        style="stroke"
        strokeWidth={1.6}
        color={color}
        strokeCap="round"
      />
    </Canvas>
  );
}

/** Persistent bottom nav with a tide-dot under the active tab. */
export function BottomNav({ active, onTabPress }: BottomNavProps) {
  const theme = useTheme();
  const { label } = useTypography();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const translateX = useSharedValue(0);

  const tabWidth = barWidth > 0 ? barWidth / TABS.length : 0;
  const activeIndex = TABS.findIndex((tab) => tab.id === active);

  useEffect(() => {
    if (tabWidth <= 0) return;
    translateX.value = withSpring(activeIndex * tabWidth, SPRING);
  }, [activeIndex, tabWidth, translateX]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  return (
    <View
      style={[
        styles.nav,
        {
          backgroundColor: theme.surface.raised,
          borderTopColor: theme.border.subtle,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
    >
      {tabWidth > 0 ? (
        <Animated.View pointerEvents="none" style={[styles.dotTrack, dotStyle]}>
          <View style={[styles.dot, { backgroundColor: theme.accent.aqua }]} />
        </Animated.View>
      ) : null}

      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const color = isActive ? theme.text.primary : theme.text.muted;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              if (tab.id === active) return;
              Haptics.selectionAsync();
              onTabPress(tab.id);
            }}
            style={styles.tab}
            hitSlop={4}
          >
            <NavGlyph id={tab.id} color={color} />
            <Text
              style={[
                label,
                {
                  color,
                  opacity: isActive ? 1 : 0.7,
                  marginTop: 10,
                  textTransform: 'none',
                  letterSpacing: 0.2,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 50,
  },
  dotTrack: {
    position: 'absolute',
    top: 36,
    left: 0,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 44,
  },
  icon: {
    width: ICON,
    height: ICON,
  },
});
