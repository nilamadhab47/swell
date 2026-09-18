import {
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  FadeOutLeft,
  FadeOutRight,
  ZoomIn,
} from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 160, mass: 0.8 } as const;

export function tabEntering(direction: number) {
  const motion = direction >= 0 ? FadeInRight : FadeInLeft;
  return motion.springify().damping(SPRING.damping).stiffness(SPRING.stiffness);
}

export function tabExiting(direction: number) {
  const motion = direction >= 0 ? FadeOutLeft : FadeOutRight;
  return motion.duration(180);
}

export const flowEnter = ZoomIn.duration(420).springify().damping(18).stiffness(140);
export const flowExit = FadeOut.duration(160);

export function staggerIn(delayMs: number) {
  return FadeInDown.delay(delayMs)
    .springify()
    .damping(18)
    .stiffness(150)
    .duration(480);
}

export const stepEnter = FadeInRight.springify().damping(18).stiffness(150);
export const stepEnterBack = FadeInLeft.springify().damping(18).stiffness(150);
