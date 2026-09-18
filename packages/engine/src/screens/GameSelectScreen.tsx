import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { ArtEmblem, ART } from '../components/ArtEmblem';
import { GlassCard } from '../components/GlassCard';
import { OceanBackground } from '../components/OceanBackground';
import { useFlowStore } from '../flow/useFlowStore';
import type { GameId } from '../flow/types';
import { FadeBlock } from '../motion/FadeBlock';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

const GAMES: {
  id: GameId;
  name: string;
  line: string;
  icon: string;
  available: boolean;
}[] = [
  {
    id: 'block_stack',
    name: 'Block Stack',
    line: 'Hands busy. Mind quieter.',
    icon: '▣',
    available: true,
  },
  {
    id: 'color_match',
    name: 'Color Match',
    line: 'Coming when the next wave needs it.',
    icon: '◉',
    available: false,
  },
  {
    id: 'flow_connect',
    name: 'Flow Connect',
    line: 'A slower puzzle for later.',
    icon: '∞',
    available: false,
  },
  {
    id: 'tap_rhythm',
    name: 'Tap Rhythm',
    line: 'A beat to wait it out.',
    icon: '♪',
    available: false,
  },
];

export function GameSelectScreen() {
  const theme = useTheme();
  const { headline, body, title, label } = useTypography();
  const selectGame = useFlowStore((s) => s.selectGame);
  const reset = useFlowStore((s) => s.reset);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />
      <AppHeader showBack onBack={reset} />

      <View style={styles.content}>
        <FadeBlock delay={40}>
          <ArtEmblem
            source={ART.breathe}
            size={128}
            style={styles.breatheArt}
          />
          <Text style={[headline, { color: theme.text.primary, textAlign: 'center' }]}>
            Pick a place to wait it out.
          </Text>
          <Text
            style={[
              body,
              {
                color: theme.text.secondary,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 22,
              },
            ]}
          >
            Three minutes. The clock is already running in your favor.
          </Text>
        </FadeBlock>

        <View style={styles.grid}>
          {GAMES.map((game, index) => (
            <FadeBlock key={game.id} delay={80 + index * 60}>
              <Pressable
                disabled={!game.available}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  selectGame(game.id);
                }}
                style={({ pressed }) => [
                  { opacity: game.available ? (pressed ? 0.8 : 1) : 0.4 },
                ]}
              >
                <GlassCard style={styles.tile}>
                  <Text
                    style={{
                      fontSize: 28,
                      color: theme.text.secondary,
                    }}
                  >
                    {game.icon}
                  </Text>
                  <Text
                    style={[
                      title,
                      { color: theme.text.primary, marginTop: 12 },
                    ]}
                  >
                    {game.name}
                  </Text>
                  <Text
                    style={[
                      label,
                      {
                        color: theme.text.secondary,
                        marginTop: 6,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {game.available ? game.line : 'Soon'}
                  </Text>
                </GlassCard>
              </Pressable>
            </FadeBlock>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    justifyContent: 'center',
  },
  breatheArt: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  grid: {
    marginTop: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  tile: {
    width: 150,
    padding: 24,
    alignItems: 'center',
    minHeight: 148,
  },
});
