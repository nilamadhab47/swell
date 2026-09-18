import type { ComponentProps } from 'react';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

type Entering = NonNullable<ComponentProps<typeof Animated.View>['entering']>;
type Exiting = NonNullable<ComponentProps<typeof Animated.View>['exiting']>;

interface ScreenTransitionProps {
  childKey: string;
  entering?: Entering;
  exiting?: Exiting;
  children: React.ReactNode;
}

/** Cross-fades / slides a full-screen child when `childKey` changes. */
export function ScreenTransition({
  childKey,
  entering,
  exiting,
  children,
}: ScreenTransitionProps) {
  return (
    <Animated.View
      key={childKey}
      entering={entering}
      exiting={exiting}
      style={styles.fill}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
