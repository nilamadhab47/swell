import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { GlowingButton } from '../components/GlowingButton';
import { OceanBackground } from '../components/OceanBackground';
import {
  loadLastGame,
  pickSurprise,
  PLAYABLE_GAMES,
  saveLastGame,
  type PlayableGame,
} from '../flow/games';
import { useFlowStore } from '../flow/useFlowStore';
import { FadeBlock } from '../motion/FadeBlock';
import { useTypography } from '../theme/useTypography';
import { useTheme } from '../theme/useTheme';

const GAME_COPY: Record<
  PlayableGame,
  { name: string; line: string; icon: string }
> = {
  block_stack: {
    name: 'Block Stack',
    line: 'Hands busy. Mind quieter.',
    icon: '▣',
  },
  scribble: {
    name: 'Scribble',
    line: 'Draw anything. Fill the time.',
    icon: '✎',
  },
  flappy: {
    name: 'Float',
    line: 'Tap to drift. You can’t lose.',
    icon: '🪶',
  },
};

export function GameSelectScreen() {
  const theme = useTheme();
  const { headline, body, title, label } = useTypography();
  const selectGame = useFlowStore((s) => s.selectGame);
  const reset = useFlowStore((s) => s.reset);
  const [lastGame, setLastGame] = useState<PlayableGame | null>(null);

  useEffect(() => {
    void loadLastGame().then(setLastGame);
  }, []);

  const start = useCallback(
    (gameId: PlayableGame) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      void saveLastGame(gameId);
      selectGame(gameId);
    },
    [selectGame],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.surface.canvas }]}>
      <OceanBackground />
      <AppHeader showBack onBack={reset} />

      <View style={styles.content}>
        <FadeBlock delay={40}>
          <Text style={[headline, { color: theme.text.primary, textAlign: 'center' }]}>
            Your 3-minute reset
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
            Pick something to do while the craving passes.
          </Text>
        </FadeBlock>

        <FadeBlock delay={80} style={styles.surprise}>
          <GlowingButton
            label="Surprise me"
            onPress={() => start(pickSurprise(lastGame))}
            style={{ width: '100%', maxWidth: 320 }}
          />
        </FadeBlock>

        <Text
          style={[
            label,
            {
              color: theme.text.muted,
              textAlign: 'center',
              marginTop: 8,
              marginBottom: 4,
            },
          ]}
        >
          Or pick
        </Text>

        <View style={styles.grid}>
          {PLAYABLE_GAMES.map((id, index) => {
            const game = GAME_COPY[id];
            const isLast = lastGame === id;
            return (
              <FadeBlock key={id} delay={120 + index * 60}>
                <Pressable
                  onPress={() => start(id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                >
                  <GlassCard style={styles.tile}>
                    <Text style={{ fontSize: 28, color: theme.accent.aqua }}>
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
                      {isLast ? 'Last ride' : game.line}
                    </Text>
                  </GlassCard>
                </Pressable>
              </FadeBlock>
            );
          })}
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
    paddingTop: 16,
    paddingBottom: 48,
    justifyContent: 'center',
  },
  surprise: {
    marginTop: 28,
    alignItems: 'center',
  },
  grid: {
    marginTop: 16,
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
