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
  AppState,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  userName?: string;
}

export function BlockStackGame({
  durationSecs,
  onComplete,
  onEarlyExit,
  userName,
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
  const [scorePopup, setScorePopup] = useState<{ points: number; key: number } | null>(null);

  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionSeed = useRef(Math.floor(Math.random() * 10000));

  // ----- Animation shared values -----
  const boardScale = useSharedValue(1);
  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.9);
  const popupOpacity = useSharedValue(0);
  const popupY = useSharedValue(0);

  // ----- Finish handler -----
  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (tickRef.current) clearTimeout(tickRef.current as unknown as ReturnType<typeof setTimeout>);

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

  // ----- Resume from background: immediately sync timer -----
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !completedRef.current) {
        const elapsed = (Date.now() - startRef.current) / 1000;
        setCoolProgress(Math.min(1, elapsed / durationSecs));
        setRemainingSecs(Math.max(0, Math.ceil(durationSecs - elapsed)));
        if (elapsed >= durationSecs) finish();
      }
    });
    return () => sub.remove();
  }, [durationSecs, finish]);

  // ----- Lock a piece into the board, clear lines, spawn next -----
  const lockPiece = useCallback(
    (pieceToLock: Piece) => {
      setBoard((prev) => {
        const placed = placePiece(prev, pieceToLock);
        const { board: cleared, cleared: lines, clearedRows } = clearLines(placed);

        if (lines > 0) {
          const points = lines >= 4 ? 800 : lines >= 3 ? 500 : lines >= 2 ? 300 : 100;
          setScore((s) => s + points);
          setClearedRowsFlash(clearedRows);

          // Score popup
          setScorePopup({ points, key: Date.now() });
          popupOpacity.value = 0;
          popupY.value = 0;
          popupOpacity.value = withSequence(
            withTiming(1, { duration: 150 }),
            withTiming(1, { duration: 600 }),
            withTiming(0, { duration: 400 }),
          );
          popupY.value = withTiming(-40, { duration: 1150, easing: Easing.out(Easing.quad) });
          setTimeout(() => setScorePopup(null), 1200);

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

          setTimeout(() => setClearedRowsFlash([]), 400);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }

        return cleared;
      });

      // Spawn next piece at the top
      setPiece(randomPiece());
    },
    [boardScale, popupOpacity, popupY],
  );

  // Check game over after piece/board changes
  useEffect(() => {
    if (!canPlace(board, piece.matrix, piece.row, piece.col)) {
      setGameOver(true);
      // Reset board on game over — the session continues (this IS the intervention)
      setTimeout(() => {
        setBoard(emptyBoard());
        setPiece(randomPiece());
        setGameOver(false);
      }, 800);
    }
  }, [board, piece]);

  // ----- Movement (reads state from closure — no nested setState) -----
  const move = useCallback(
    (dRow: number, dCol: number) => {
      if (completedRef.current || gameOver) return;
      const nr = piece.row + dRow;
      const nc = piece.col + dCol;
      if (canPlace(board, piece.matrix, nr, nc)) {
        if (dCol !== 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        setPiece({ ...piece, row: nr, col: nc });
      } else if (dRow > 0) {
        // Can't fall further → lock it and spawn the next piece
        lockPiece(piece);
      }
    },
    [board, piece, lockPiece, gameOver],
  );

  const rotate = useCallback(() => {
    if (completedRef.current || gameOver) return;
    const rotated = tryRotate(board, piece);
    if (rotated !== piece) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPiece(rotated);
    }
  }, [board, piece, gameOver]);

  const hardDrop = useCallback(() => {
    if (completedRef.current || gameOver) return;
    const dropRow = ghostRow(board, piece);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Lock immediately at the drop position
    lockPiece({ ...piece, row: dropRow });
  }, [board, piece, lockPiece, gameOver]);

  // ----- Auto-gravity -----
  // Keep refs to the latest move fn and progress so the loop below never
  // needs to be torn down/recreated (which was preventing gravity from firing).
  const moveRef = useRef(move);
  const coolProgressRef = useRef(coolProgress);
  useEffect(() => {
    moveRef.current = move;
  }, [move]);
  useEffect(() => {
    coolProgressRef.current = coolProgress;
  }, [coolProgress]);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled || completedRef.current) return;
      moveRef.current(1, 0);
      tickRef.current = setTimeout(
        tick,
        getDropInterval(coolProgressRef.current),
      ) as unknown as ReturnType<typeof setInterval>;
    };
    tickRef.current = setTimeout(
      tick,
      getDropInterval(coolProgressRef.current),
    ) as unknown as ReturnType<typeof setInterval>;
    return () => {
      cancelled = true;
      if (tickRef.current) clearTimeout(tickRef.current as unknown as ReturnType<typeof setTimeout>);
    };
  }, []);

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

  // ----- Score popup animated style -----
  const popupStyle = useAnimatedStyle(() => ({
    opacity: popupOpacity.value,
    transform: [{ translateY: popupY.value }],
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

        // Ghost piece preview (drop target)
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
              <View
                key={`ghost-${r}-${c}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: w,
                  height: h,
                  borderRadius: BLOCK_RADIUS,
                  borderWidth: 2,
                  borderColor: colors.from,
                  opacity: 0.3,
                }}
              />,
            );
          }
        }

        if (cellVal === 0) continue;

        const colors = pieceColors[cellVal] || pieceColors[1];

        cells.push(
          <View
            key={`block-${r}-${c}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: BLOCK_RADIUS,
              backgroundColor: isFlashing ? '#ffffff' : colors.from,
              borderBottomWidth: isFlashing ? 0 : 3,
              borderBottomColor: colors.to,
              borderTopWidth: isFlashing ? 0 : 1.5,
              borderTopColor: 'rgba(255,255,255,0.4)',
              shadowColor: colors.to,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isFlashing ? 0.8 : 0.25,
              shadowRadius: isFlashing ? 8 : 2,
            }}
          />,
        );
      }
    }

    return cells;
  }, [board, piece, ghost, clearedRowsFlash, pieceColors]);

  // ----- Subtle grid lines (RN Views) -----
  const gridColor = theme.scheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(14,42,54,0.05)';
  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    for (let r = 1; r < ROWS; r++) {
      lines.push(
        <View
          key={`hline-${r}`}
          style={{
            position: 'absolute',
            left: 0,
            top: r * CELL,
            width: BOARD_W,
            height: StyleSheet.hairlineWidth,
            backgroundColor: gridColor,
          }}
        />,
      );
    }
    for (let c = 1; c < COLS; c++) {
      lines.push(
        <View
          key={`vline-${c}`}
          style={{
            position: 'absolute',
            left: c * CELL,
            top: 0,
            width: StyleSheet.hairlineWidth,
            height: BOARD_H,
            backgroundColor: gridColor,
          }}
        />,
      );
    }
    return lines;
  }, [gridColor]);

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
    <View style={styles.container}>
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
        userName={userName}
      />

      {/* Game board */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.boardWrap,
          boardAnimatedStyle,
          {
            width: BOARD_W,
            height: BOARD_H,
            backgroundColor: boardBg,
            borderColor: controlBorder,
          },
        ]}
      >
        {gridLines}
        {renderBoard}
      </Animated.View>

      {/* Score popup */}
      {scorePopup && (
        <Animated.View style={[styles.scorePopup, popupStyle]} pointerEvents="none">
          <Text style={[styles.scorePopupText, { color: theme.state.success, fontFamily: theme.fonts.display }]}>
            +{scorePopup.points}
          </Text>
        </Animated.View>
      )}

      {/* Controls — gesture-first. Swipe the board to move; these are helpers. */}
      <View style={styles.controls}>
        <View style={styles.ctrlRow}>
          <Pressable
            style={[styles.pillBtn, { backgroundColor: controlBg, borderColor: controlBorder }]}
            onPress={rotate}
          >
            <Text style={[styles.pillIcon, { color: theme.text.primary }]}>↻</Text>
            <Text style={[styles.pillLabel, { color: theme.text.secondary }]}>Rotate</Text>
          </Pressable>

          <Pressable
            style={[styles.pillBtn, { backgroundColor: controlBg, borderColor: controlBorder }]}
            onPress={hardDrop}
          >
            <Text style={[styles.pillIcon, { color: theme.text.primary }]}>↓</Text>
            <Text style={[styles.pillLabel, { color: theme.text.secondary }]}>Drop</Text>
          </Pressable>
        </View>
      </View>

      {/* Swipe hint */}
      <Text style={[styles.hint, { color: theme.text.muted }]}>
        swipe to move · tap to rotate · swipe down to drop
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
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 0.5,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pillIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  pillLabel: {
    fontSize: 15,
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
  scorePopup: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    zIndex: 5,
  },
  scorePopupText: {
    fontSize: 28,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
