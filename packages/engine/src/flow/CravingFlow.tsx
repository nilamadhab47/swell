import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFlowStore } from '../flow/useFlowStore';
import { flowEnter, flowExit } from '../motion/presets';
import { GameScreen } from '../screens/GameScreen';
import { GameSelectScreen } from '../screens/GameSelectScreen';
import { ReflectScreen } from '../screens/ReflectScreen';
import { VictoryScreen } from '../screens/VictoryScreen';
import { useTheme } from '../theme/useTheme';

/** In-game flow only — Home lives in AppShell when idle. */
export function CravingFlow() {
  const state = useFlowStore((s) => s.state);
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.surface.canvas }]}>
      <Animated.View
        key={state}
        entering={flowEnter}
        exiting={flowExit}
        style={styles.fill}
      >
        {state === 'game_select' && <GameSelectScreen />}
        {state === 'game' && <GameScreen />}
        {state === 'victory' && <VictoryScreen />}
        {state === 'reflect' && <ReflectScreen />}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});
