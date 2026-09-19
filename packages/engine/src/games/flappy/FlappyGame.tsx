/**
 * FlappyGame — a calm, forgiving "keep it floating" game.
 *
 * This is the craving intervention, not an arcade challenge. It is tuned to be
 * gentle and hypnotic rather than punishing:
 * - Slow pipes, generous gaps, soft gravity.
 * - A crash does NOT end the 3:00 session — the bird gently resets and you
 *   keep going. You cannot "lose" your way out of the intervention.
 * - Tap anywhere to flap. No arrows, no clutter.
 *
 * Rendered with plain React Native Views for rock-solid reliability, driven by
 * a single requestAnimationFrame loop that reads physics from refs.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { CoolingBackground } from '../../components/CoolingBackground';
import { CravingTimer } from '../../craving/CravingTimer';
import { CravingMessageOverlay } from '../../craving/CravingMessageOverlay';
import { useTheme } from '../../theme/useTheme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PLAY_W = SCREEN_W - 32;
const PLAY_H = Math.min(Math.max(SCREEN_H - 300, 380), 560);

// ----- Physics (calm & forgiving) -----
const GRAVITY = 1650; // px/s²
const FLAP_V = -460; // px/s impulse
const MAX_FALL = 620; // terminal velocity
const PIPE_SPEED = 120; // px/s (slow)
const PIPE_W = 62;
const GAP = Math.min(Math.max(PLAY_H * 0.34, 210), 260);
const PIPE_SPACING = PLAY_W * 0.9; // horizontal distance between pairs
const BIRD_X = PLAY_W * 0.28;
const BIRD_R = 15;
const EDGE_MARGIN = 46; // keep gaps away from top/bottom edges

interface Pipe {
  id: number;
  x: number;
  gapY: number;
  passed: boolean;
}

interface FlappyGameProps {
  durationSecs: number;
  onComplete: (actualDurationSecs: number) => void;
  onEarlyExit?: () => void;
}

function makePipe(id: number, x: number): Pipe {
  const min = GAP / 2 + EDGE_MARGIN;
  const max = PLAY_H - GAP / 2 - EDGE_MARGIN;
  const gapY = min + Math.random() * (max - min);
  return { id, x, gapY, passed: false };
}

export function FlappyGame({
  durationSecs,
  onComplete,
  onEarlyExit,
}: FlappyGameProps) {
  const theme = useTheme();

  // ----- Session state -----
  const [score, setScore] = useState(0);
  const [coolProgress, setCoolProgress] = useState(0);
  const [remainingSecs, setRemainingSecs] = useState(durationSecs);
  const [started, setStarted] = useState(false);
  const [, setTick] = useState(0); // forces re-render each frame

  // ----- Physics refs (mutated inside the rAF loop) -----
  const birdYRef = useRef(PLAY_H / 2);
  const birdVRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const pipeIdRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const sessionSeed = useRef(Math.floor(Math.random() * 10000));

  // ----- Animations -----
  const flashOpacity = useSharedValue(0);
  const shake = useSharedValue(0);
  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.9);

  // ----- Finish -----
  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completionOpacity.value = withTiming(1, { duration: 600 });
    completionScale.value = withSpring(1, { damping: 14, stiffness: 100 });
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    setTimeout(() => onComplete(elapsed), 1200);
  }, [onComplete, completionOpacity, completionScale]);

  // ----- Timer -----
  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCoolProgress(Math.min(1, elapsed / durationSecs));
      setRemainingSecs(Math.max(0, Math.ceil(durationSecs - elapsed)));
      if (elapsed >= durationSecs) {
        clearInterval(id);
        finish();
      }
    }, 200);
    return () => clearInterval(id);
  }, [durationSecs, finish]);

  // ----- Soft reset on crash (never ends the session) -----
  const softReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    flashOpacity.value = withSequence(
      withTiming(0.6, { duration: 80 }),
      withTiming(0, { duration: 320 }),
    );
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withSpring(0, { damping: 8, stiffness: 200 }),
    );
    birdYRef.current = PLAY_H / 2;
    birdVRef.current = 0;
    pipesRef.current = [];
    startedRef.current = false;
    setStarted(false);
  }, [flashOpacity, shake]);

  // ----- Flap -----
  const flap = useCallback(() => {
    if (completedRef.current) return;
    if (!startedRef.current) {
      startedRef.current = true;
      setStarted(true);
      // Seed the first pipe off to the right so there's a beat before it arrives
      pipesRef.current = [makePipe(pipeIdRef.current++, PLAY_W + PIPE_W)];
      lastTimeRef.current = null;
    }
    birdVRef.current = FLAP_V;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ----- Game loop -----
  useEffect(() => {
    const step = (now: number) => {
      if (completedRef.current) return;

      const last = lastTimeRef.current ?? now;
      let dt = (now - last) / 1000;
      lastTimeRef.current = now;
      // Clamp dt (e.g. after backgrounding) so physics never jumps
      if (dt > 0.05) dt = 0.05;

      if (startedRef.current) {
        // Bird physics
        birdVRef.current = Math.min(birdVRef.current + GRAVITY * dt, MAX_FALL);
        birdYRef.current += birdVRef.current * dt;

        // Move pipes
        const pipes = pipesRef.current;
        for (const p of pipes) p.x -= PIPE_SPEED * dt;

        // Score: bird passed a pipe
        for (const p of pipes) {
          if (!p.passed && p.x + PIPE_W < BIRD_X - BIRD_R) {
            p.passed = true;
            setScore((s) => s + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        }

        // Remove off-screen pipes, spawn new ones to keep spacing
        pipesRef.current = pipes.filter((p) => p.x + PIPE_W > -4);
        const rightmost = pipesRef.current.reduce(
          (mx, p) => Math.max(mx, p.x),
          -Infinity,
        );
        if (rightmost < PLAY_W - PIPE_SPACING) {
          pipesRef.current.push(makePipe(pipeIdRef.current++, PLAY_W));
        }

        // Collision detection
        const by = birdYRef.current;
        let crashed = false;
        if (by - BIRD_R < 0 || by + BIRD_R > PLAY_H) crashed = true;
        if (!crashed) {
          for (const p of pipesRef.current) {
            const withinX =
              BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W;
            if (!withinX) continue;
            const inGap =
              by - BIRD_R > p.gapY - GAP / 2 && by + BIRD_R < p.gapY + GAP / 2;
            if (!inGap) {
              crashed = true;
              break;
            }
          }
        }
        if (crashed) softReset();
      }

      setTick((t) => (t + 1) % 1000000);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [softReset]);

  // ----- Pause on background -----
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        lastTimeRef.current = null; // avoid a big dt jump
      }
    });
    return () => sub.remove();
  }, []);

  // ----- Derived styles -----
  const playfieldStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const completionStyle = useAnimatedStyle(() => ({
    opacity: completionOpacity.value,
    transform: [{ scale: completionScale.value }],
  }));

  // ----- Colors -----
  const fieldBg =
    theme.scheme === 'dark' ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.4)';
  const controlBorder =
    theme.scheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(14,42,54,0.08)';
  const controlBg =
    theme.scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)';
  const pipeColor = theme.accent.aqua;
  const pipeColorDark = theme.scheme === 'dark' ? '#0E5A54' : '#0E9488';
  const birdColor = theme.accent.coral;

  const birdRotation = Math.max(-0.35, Math.min(0.85, birdVRef.current / 700));

  return (
    <View style={styles.container}>
      <CoolingBackground coolProgress={coolProgress} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onEarlyExit) onEarlyExit();
            else finish();
          }}
          hitSlop={12}
          style={[styles.closeBtn, { backgroundColor: controlBg, borderColor: controlBorder }]}
        >
          <Text style={{ color: theme.text.secondary, fontSize: 18 }}>✕</Text>
        </Pressable>

        <CravingTimer
          totalSecs={durationSecs}
          remainingSecs={remainingSecs}
          progress={coolProgress}
        />

        <View style={styles.scoreWrap}>
          <Text style={[styles.scoreLabel, { color: theme.text.muted }]}>score</Text>
          <Text style={[styles.scoreValue, { color: theme.text.primary, fontFamily: theme.fonts.display }]}>
            {score}
          </Text>
        </View>
      </View>

      <CravingMessageOverlay
        remainingSecs={remainingSecs}
        sessionSeed={sessionSeed.current}
      />

      {/* Playfield */}
      <View style={styles.fieldOuter}>
        <Animated.View
          style={[
            styles.field,
            playfieldStyle,
            { width: PLAY_W, height: PLAY_H, backgroundColor: fieldBg, borderColor: controlBorder },
          ]}
        >
          {/* Pipes */}
          {pipesRef.current.map((p) => (
            <React.Fragment key={p.id}>
              {/* Top pipe */}
              <View
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: 0,
                  width: PIPE_W,
                  height: Math.max(0, p.gapY - GAP / 2),
                  backgroundColor: pipeColor,
                  borderBottomWidth: 6,
                  borderBottomColor: pipeColorDark,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                }}
              />
              {/* Bottom pipe */}
              <View
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.gapY + GAP / 2,
                  width: PIPE_W,
                  height: Math.max(0, PLAY_H - (p.gapY + GAP / 2)),
                  backgroundColor: pipeColor,
                  borderTopWidth: 6,
                  borderTopColor: pipeColorDark,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}
              />
            </React.Fragment>
          ))}

          {/* Bird */}
          <View
            style={{
              position: 'absolute',
              left: BIRD_X - BIRD_R,
              top: birdYRef.current - BIRD_R,
              width: BIRD_R * 2,
              height: BIRD_R * 2,
              borderRadius: BIRD_R,
              backgroundColor: birdColor,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.55)',
              transform: [{ rotate: `${birdRotation}rad` }],
              shadowColor: birdColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.35,
              shadowRadius: 5,
            }}
          >
            {/* eye */}
            <View
              style={{
                position: 'absolute',
                right: 5,
                top: 6,
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: '#0E2A36',
              }}
            />
          </View>

          {/* Crash flash */}
          <Animated.View
            pointerEvents="none"
            style={[styles.flash, flashStyle, { backgroundColor: theme.accent.coral }]}
          />

          {/* Tap-to-start hint */}
          {!started && (
            <View style={styles.startHint} pointerEvents="none">
              <Text style={[styles.startTitle, { color: theme.text.primary, fontFamily: theme.fonts.display }]}>
                Tap to float
              </Text>
              <Text style={[styles.startSub, { color: theme.text.secondary }]}>
                Just keep it drifting. The craving will pass.
              </Text>
            </View>
          )}

          {/* Full-field tap surface */}
          <Pressable style={StyleSheet.absoluteFill} onPressIn={flap} />
        </Animated.View>
      </View>

      {/* Hint */}
      <Text style={[styles.hint, { color: theme.text.muted }]}>
        tap anywhere to flap · you can’t lose — just breathe
      </Text>

      {/* Completion overlay */}
      {completedRef.current && (
        <Animated.View
          style={[styles.completionOverlay, completionStyle, { backgroundColor: theme.surface.canvas }]}
        >
          <Text style={[styles.completionText, { color: theme.state.success, fontFamily: theme.fonts.display }]}>
            You made it through.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
    zIndex: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreWrap: { alignItems: 'center', minWidth: 40 },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: { fontSize: 18, fontWeight: '700' },
  fieldOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    overflow: 'hidden',
  },
  flash: { ...StyleSheet.absoluteFillObject },
  startHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  startTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  startSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  completionText: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
});
