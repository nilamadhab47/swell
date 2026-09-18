import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Canvas,
  Group,
  RoundedRect,
} from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { CoolingBackground } from '../../components/CoolingBackground';
import { useTheme } from '../../theme/useTheme';

const COLS = 8;
const ROWS = 12;
const { width: SCREEN_W } = Dimensions.get('window');
const CELL = Math.floor((SCREEN_W - 32) / COLS);
const BOARD_W = CELL * COLS;
const BOARD_H = CELL * ROWS;

type Cell = 0 | 1;
type Board = Cell[][];

const SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[]);
}

function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

function canPlace(
  board: Board,
  shape: number[][],
  row: number,
  col: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = row + r;
      const nc = col + c;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (board[nr][nc]) return false;
    }
  }
  return true;
}

function place(
  board: Board,
  shape: number[][],
  row: number,
  col: number
): Board {
  const next = board.map((r) => [...r]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) next[row + r][col + c] = 1;
    }
  }
  return next;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const remaining = board.filter((row) => row.some((c) => c === 0));
  const cleared = ROWS - remaining.length;
  while (remaining.length < ROWS) {
    remaining.unshift(Array(COLS).fill(0) as Cell[]);
  }
  return { board: remaining, cleared };
}

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
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [piece, setPiece] = useState(() => ({
    shape: randomShape(),
    row: 0,
    col: Math.floor(COLS / 2) - 1,
  }));
  const [coolProgress, setCoolProgress] = useState(0);
  const [score, setScore] = useState(0);
  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (tickRef.current) clearInterval(tickRef.current);
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(elapsed);
  }, [onComplete]);

  useEffect(() => {
    startRef.current = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setCoolProgress(Math.min(1, elapsed / durationSecs));
      if (elapsed >= durationSecs) {
        clearInterval(progressInterval);
        finish();
      }
    }, 200);

    return () => clearInterval(progressInterval);
  }, [durationSecs, finish]);

  const lockPiece = useCallback(() => {
    setBoard((prev) => {
      const placed = place(prev, piece.shape, piece.row, piece.col);
      const { board: cleared, cleared: lines } = clearLines(placed);
      if (lines > 0) {
        setScore((s) => s + lines * 100);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return cleared;
    });
    setPiece({
      shape: randomShape(),
      row: 0,
      col: Math.floor(COLS / 2) - 1,
    });
  }, [piece]);

  const move = useCallback(
    (dRow: number, dCol: number) => {
      setPiece((p) => {
        const nr = p.row + dRow;
        const nc = p.col + dCol;
        if (canPlace(board, p.shape, nr, nc)) {
          return { ...p, row: nr, col: nc };
        }
        if (dRow > 0) lockPiece();
        return p;
      });
    },
    [board, lockPiece]
  );

  useEffect(() => {
    tickRef.current = setInterval(() => move(1, 0), 600);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [move]);

  // Blocks cool with the background: warm → neutral → calm teal.
  const blockColor =
    coolProgress < 0.33
      ? theme.signature.heatStart
      : coolProgress < 0.66
        ? theme.signature.heatMid
        : theme.signature.calmEnd;

  const ghostBoard = place(board, piece.shape, piece.row, piece.col);

  return (
    <View style={styles.container}>
      <CoolingBackground coolProgress={coolProgress} />

      <View style={styles.header}>
        <Pressable
          onPress={finish}
          hitSlop={12}
          style={[
            styles.closeBtn,
            {
              backgroundColor: theme.surface.glass,
              borderColor: theme.border.subtle,
            },
          ]}
        >
          <Text style={{ color: theme.text.secondary, fontSize: 18 }}>
            ✕
          </Text>
        </Pressable>
        <View style={styles.spacer} />
      </View>

      <View
        style={[styles.boardWrap, { borderColor: theme.border.subtle }]}
      >
        <Canvas style={{ width: BOARD_W, height: BOARD_H }}>
          <Group>
            {ghostBoard.map((row, r) =>
              row.map((cell, c) =>
                cell ? (
                  <RoundedRect
                    key={`${r}-${c}`}
                    x={c * CELL + 1}
                    y={r * CELL + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    r={4}
                    color={blockColor}
                    opacity={r < piece.row || (r === piece.row && c < piece.col) ? 1 : 0.85}
                  />
                ) : null
              )
            )}
          </Group>
        </Canvas>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[
            styles.ctrlBtn,
            {
              borderColor: theme.border.subtle,
              backgroundColor: theme.surface.glass,
            },
          ]}
          onPress={() => move(0, -1)}
        >
          <Text style={{ color: theme.text.primary, fontSize: 28 }}>←</Text>
        </Pressable>
        <Pressable
          style={[
            styles.ctrlBtn,
            {
              borderColor: theme.border.subtle,
              backgroundColor: theme.surface.glass,
            },
          ]}
          onPress={() => move(0, 1)}
        >
          <Text style={{ color: theme.text.primary, fontSize: 28 }}>→</Text>
        </Pressable>
        <Pressable
          style={[
            styles.ctrlBtn,
            {
              borderColor: theme.border.subtle,
              backgroundColor: theme.surface.glass,
            },
          ]}
          onPress={() => move(1, 0)}
        >
          <Text style={{ color: theme.text.primary, fontSize: 28 }}>↓</Text>
        </Pressable>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    zIndex: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 40,
  },
  boardWrap: {
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 32,
    zIndex: 1,
  },
  ctrlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
