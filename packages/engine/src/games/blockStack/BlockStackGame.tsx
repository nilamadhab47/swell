/**
 * BlockStackGame — Premium craving intervention game.
 *
 * The game IS the craving intervention. Every visual, animation, and
 * interaction is designed around: "Help me get through this craving."
 *
 * Features:
 * - Colorful gradient pieces (Skia)
 * - Swipe controls (PanResponder) + redesigned buttons
 * - Rotation
 * - Ghost piece preview
 * - Haptic feedback on every interaction
 * - Animated line clears
 * - Integrated 3:00 countdown timer
 * - Timed encouragement messages
 * - Visual phase progression (calm → energy → celebration)
 * - Beautiful timer completion transition
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Canvas,
  Group,
  LinearGradient,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { CoolingBackground } from '../../components/CoolingBackground';
import { CravingTimer } from '../../craving/CravingTimer';
import { CravingMessageOverlay } from '../../craving/CravingMessageOverlay';
import { useTheme } from '../../theme/useTheme';
import {
  COLS,
  ROWS,
  canPlace,
  clearLines,
  emptyBoard,
  ghostRow,
  placePiece,
  randomPiece,
  tryRotate,
  type Board,
  type Piece,
} from './engine';
import {
  BLOCK_GAP,
  BLOCK_RADIUS,
  BOARD_PADDING,
  getDropInterval,
  getPieceColors,
} from './constants';

const { width: SCREEN_W } = Dimensions.get('window');
const CELL = Math.floor((SCREEN_W - BOARD_PADDING * 2 - 32) / COLS);
const BOARD_W = CELL * COLS;
const BOARD_H = CELL * ROWS;

interface BlockStackGameProps {
  durationSecs: number;
  onComplete: (actualDurationSecs: number) => void;
  onEarlyExit?: () => void;
}

export function BlockStackGame({
  durationSecs,
  onComplete,
  onEarlyExit,
}: BlockStackGameProps) {
  const theme = useTheme();
  const pieceColors = useMemo(() => getPieceColors(theme), [theme]);

  // ----- Game state -----
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [piece, setPiece] = useState<Piece>(randomPiece);
  const [score, setScore] = useState(0);
  const [coolProgress, setCoolProgress] = useState(0);
  const [remainingSecs, setRemainingSecs] = useState(durationSecs);
  const [clearedRowsFlash, setClearedRowsFlash] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionSeed = useRef(Math.floor(Math.random() * 10000));

  // ----- Animation shared values -----
  const boardScale = useSharedValue(1);
  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.9);

  // ----- Finish handler -----
  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (tickRef.current) clearInterval(tickRef.current);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Beautiful completion animation
    completionOpacity.value = withTiming(1, { duration: 600 });
    completionScale.value = withSpring(1, { damping: 14, stiffness: 100 });

    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    setTimeout(() => onComplete(elapsed), 1200);
  }, [onComplete, completionOpacity, completionScale]);

  // ----- Timer -----
  useEffect(() => {
    startRef.current = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const progress = Math.min(1, elapsed / durationSecs);
      const remaining = Math.max(0, Math.ceil(durationSecs - elapsed));

      setCoolProgress(progress);
      setRemainingSecs(remaining);

      if (elapsed >= durationSecs) {
        clearInterval(progressInterval);
        finish();
      }
    }, 200);

    return () => clearInterval(progressInterval);
  }, [durationSecs, finish]);

  // ----- Lock piece -----
  const lockPiece = useCallback(() => {
    setBoard((prev) => {
      const placed = placePiece(prev, piece);
      const { board: cleared, cleared: lines, clearedRows } = clearLines(placed);

      if (lines > 0) {
        setScore((s) => s + lines * 100);
        setClearedRowsFlash(clearedRows);

        // Haptics scale with line count
        if (lines >= 4) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (lines >= 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Board shake on multi-clear
        if (lines >= 2) {
          boardScale.value = withSequence(
            withTiming(0.98, { duration: 60 }),
            withSpring(1, { damping: 10, stiffness: 200 }),
          );
        }

        // Clear the flash after animation
        setTimeout(() => setClearedRowsFlash([]), 400);
      } else {
        // Landing haptic (subtle)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }

      return cleared;
    });

    const next = randomPiece();
    setPiece(next);
    // Game over check will happen on next render since we set new piece at row 0
  }, [piece, boardScale]);

  // Check game over after piece changes
  useEffect(() => {
    if (!canPlace(board, piece.matrix, piece.row, piece.col)) {
      setGameOver(true);
      // Reset board on game over (the session continues — user doesn't lose the craving intervention)
      setTimeout(() => {
        setBoard(emptyBoard());
        setPiece(randomPiece());
        setGameOver(false);
      }, 800);
    }
  }, [board, piece]);

  // ----- Movement -----
  const move = useCallback(
    (dRow: number, dCol: number) => {
      if (completedRef.current || gameOver) return;
      setPiece((p) => {
        const nr = p.row + dRow;
        const nc = p.col + dCol;
        if (canPlace(board, p.matrix, nr, nc)) {
          if (dCol !== 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
          return { ...p, row: nr, col: nc };
        }
        if (dRow > 0) lockPiece();
        return p;
      });
    },
    [board, lockPiece, gameOver],
  );

  const rotate = useCallback(() => {
    if (completedRef.current || gameOver) return;
    setPiece((p) => {
      const rotated = tryRotate(board, p);
      if (rotated !== p) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return rotated;
    });
  }, [board, gameOver]);

  const hardDrop = useCallback(() => {
    if (completedRef.current || gameOver) return;
    setPiece((p) => {
      const dropRow = ghostRow(board, p);
      if (dropRow > p.row) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return { ...p, row: dropRow };
      }
      return p;
    });
    // lockPiece will be triggered by the gravity tick finding no room to move
  }, [board, gameOver]);

  // ----- Auto-gravity -----
  useEffect(() => {
    const interval = getDropInterval(coolProgress);
    tickRef.current = setInterval(() => move(1, 0), interval);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [move, coolProgress]);

  // ----- Swipe gesture (PanResponder) -----
  const swipeThreshold = 30;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 10 || Math.abs(g.dy) > 10,
        onPanResponderRelease: (_, gestureState) => {
          const { dx, dy } = gestureState;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          if (absDx < swipeThreshold && absDy < swipeThreshold) {
            // Tap → rotate
            rotate();
            return;
          }

          if (absDx > absDy) {
            // Horizontal swipe
            const steps = Math.max(1, Math.floor(absDx / CELL));
            for (let i = 0; i < steps; i++) {
              move(0, dx > 0 ? 1 : -1);
            }
          } else if (dy > swipeThreshold) {
            // Swipe down → hard drop
            hardDrop();
          }
        },
      }),
    [move, rotate, hardDrop],
  );

  // ----- Board animated style -----
  const boardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: boardScale.value }],
  }));

  // ----- Completion overlay -----
  const completionStyle = useAnimatedStyle(() => ({
    opacity: completionOpacity.value,
    transform: [{ scale: completionScale.value }],
  }));

  // ----- Ghost piece -----
  const ghost = useMemo(() => {
    const gRow = ghostRow(board, piece);
    return { ...piece, row: gRow };
  }, [board, piece]);

  // ----- Render board with pieces -----
  const renderBoard = useMemo(() => {
    const merged = placePiece(board, piece);
    const cells: React.ReactNode[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cellVal = merged[r][c];
        const isFlashing = clearedRowsFlash.includes(r);
        const x = c * CELL + BLOCK_GAP;
        const y = r * CELL + BLOCK_GAP;
        const w = CELL - BLOCK_GAP * 2;
        const h = CELL - BLOCK_GAP * 2;

        // Ghost piece preview
        if (
          cellVal === 0 &&
          ghost.row !== piece.row &&
          r >= ghost.row &&
          r < ghost.row + ghost.matrix.length &&
          c >= ghost.col &&
          c < ghost.col + ghost.matrix[0].length
        ) {
          const gr = r - ghost.row;
          const gc = c - ghost.col;
          if (ghost.matrix[gr]?.[gc]) {
            const colors = pieceColors[ghost.shapeId] || pieceColors[1];
            cells.push(
              <RoundedRect
                key={`ghost-${r}-${c}`}
                x={x}
                y={y}
                width={w}
                height={h}
                r={BLOCK_RADIUS}
                color={colors.from}
                opacity={0.15}
              />,
            );
          }
        }

        if (cellVal === 0) continue;

        const colors = pieceColors[cellVal] || pieceColors[1];

        if (isFlashing) {
          // Flash effect on cleared rows
          cells.push(
            <RoundedRect
              key={`flash-${r}-${c}`}
              x={x}
              y={y}
              width={w}
              height={h}
              r={BLOCK_RADIUS}
              color="white"
              opacity={0.9}
            />,
          );
        } else {
          cells.push(
            <Group key={`block-${r}-${c}`}>
              <RoundedRect x={x} y={y} width={w} height={h} r={BLOCK_RADIUS}>
                <LinearGradient
                  start={vec(x, y)}
                  end={vec(x + w, y + h)}
                  colors={[colors.from, colors.to]}
                />
              </RoundedRect>
              {/* Inner highlight for depth */}
              <RoundedRect
                x={x + 1}
                y={y + 1}
                width={w - 2}
                height={h * 0.4}
                r={BLOCK_RADIUS - 1}
                color="white"
                opacity={0.18}
              />
            </Group>,
          );
        }
      }
    }

    return cells;
  }, [board, piece, ghost, clearedRowsFlash, pieceColors]);

  // ----- Subtle grid lines -----
  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    for (let r = 1; r < ROWS; r++) {
      lines.push(
        <RoundedRect
          key={`hline-${r}`}
          x={0}
          y={r * CELL}
          width={BOARD_W}
          height={0.5}
          r={0}
          color={theme.scheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(14,42,54,0.04)'}
        />,
      );
    }
    for (let c = 1; c < COLS; c++) {
      lines.push(
        <RoundedRect
          key={`vline-${c}`}
          x={c * CELL}
          y={0}
          width={0.5}
          height={BOARD_H}
          r={0}
          color={theme.scheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(14,42,54,0.04)'}
        />,
      );
    }
    return lines;
  }, [theme.scheme]);

  const boardBg = theme.scheme === 'dark'
    ? 'rgba(0,0,0,0.3)'
    : 'rgba(255,255,255,0.45)';

  const controlBg = theme.scheme === 'dark'
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(255,255,255,0.7)';

  const controlBorder = theme.scheme === 'dark'
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(14,42,54,0.08)';

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <CoolingBackground coolProgress={coolProgress} />

      {/* Header: close + timer */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onEarlyExit) {
              onEarlyExit();
            } else {
              finish();
            }
          }}
          hitSlop={12}
          style={[
            styles.closeBtn,
            { backgroundColor: controlBg, borderColor: controlBorder },
          ]}
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

      {/* Encouragement message */}
      <CravingMessageOverlay
        remainingSecs={remainingSecs}
        sessionSeed={sessionSeed.current}
      />

      {/* Game board */}
      <Animated.View
        style={[
          styles.boardWrap,
          boardAnimatedStyle,
          {
            backgroundColor: boardBg,
            borderColor: controlBorder,
          },
        ]}
      >
        <Canvas style={{ width: BOARD_W, height: BOARD_H }}>
          <Group>
            {gridLines}
            {renderBoard}
          </Group>
        </Canvas>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Rotate */}
        <Pressable
          style={[styles.ctrlBtn, styles.ctrlRotate, { backgroundColor: controlBg, borderColor: controlBorder }]}
          onPress={rotate}
        >
          <Text style={[styles.ctrlIcon, { color: theme.text.primary }]}>↻</Text>
        </Pressable>

        <View style={styles.ctrlRow}>
          {/* Left */}
          <Pressable
            style={[styles.ctrlBtn, { backgroundColor: controlBg, borderColor: controlBorder }]}
            onPress={() => move(0, -1)}
          >
            <Text style={[styles.ctrlIcon, { color: theme.text.primary }]}>←</Text>
          </Pressable>

          {/* Down (soft drop) */}
          <Pressable
            style={[styles.ctrlBtn, styles.ctrlDown, { backgroundColor: controlBg, borderColor: controlBorder }]}
            onPress={() => move(1, 0)}
            onLongPress={hardDrop}
          >
            <Text style={[styles.ctrlIcon, { color: theme.text.primary }]}>↓</Text>
          </Pressable>

          {/* Right */}
          <Pressable
            style={[styles.ctrlBtn, { backgroundColor: controlBg, borderColor: controlBorder }]}
            onPress={() => move(0, 1)}
          >
            <Text style={[styles.ctrlIcon, { color: theme.text.primary }]}>→</Text>
          </Pressable>
        </View>
      </View>

      {/* Swipe hint */}
      <Text style={[styles.hint, { color: theme.text.muted }]}>
        swipe to move · tap board to rotate
      </Text>

      {/* Timer completion overlay */}
      {completedRef.current && (
        <Animated.View
          style={[
            styles.completionOverlay,
            completionStyle,
            { backgroundColor: theme.surface.canvas },
          ]}
        >
          <Text
            style={[
              styles.completionText,
              { color: theme.state.success, fontFamily: theme.fonts.display },
            ]}
          >
            You made it through.
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scoreWrap: {
    alignItems: 'center',
    minWidth: 40,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  boardWrap: {
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1,
    marginTop: 8,
  },
  controls: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
    zIndex: 1,
    gap: 8,
  },
  ctrlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  ctrlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  ctrlRotate: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ctrlDown: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  ctrlIcon: {
    fontSize: 26,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  completionText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
});
