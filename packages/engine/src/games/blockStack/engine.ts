/**
 * BlockStack pure game engine — board state, collision, placement, clearing.
 * No React, no UI, no side effects. Fully testable.
 */

export const COLS = 8;
export const ROWS = 14;

export type Cell = 0 | number;
export type Board = Cell[][];
export type Shape = number[][];

/** Standard tetromino shapes as 2D arrays. Each also has an id for coloring. */
export const SHAPES: { id: number; matrix: Shape }[] = [
  { id: 1, matrix: [[1, 1, 1, 1]] },                          // I
  { id: 2, matrix: [[1, 1], [1, 1]] },                        // O
  { id: 3, matrix: [[0, 1, 0], [1, 1, 1]] },                  // T
  { id: 4, matrix: [[1, 0, 0], [1, 1, 1]] },                  // J
  { id: 5, matrix: [[0, 0, 1], [1, 1, 1]] },                  // L
  { id: 6, matrix: [[1, 1, 0], [0, 1, 1]] },                  // S
  { id: 7, matrix: [[0, 1, 1], [1, 1, 0]] },                  // Z
];

export interface Piece {
  shapeId: number;
  matrix: Shape;
  row: number;
  col: number;
}

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export function randomPiece(): Piece {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    shapeId: shape.id,
    matrix: shape.matrix,
    row: 0,
    col: Math.floor(COLS / 2) - Math.floor(shape.matrix[0].length / 2),
  };
}

export function canPlace(board: Board, matrix: Shape, row: number, col: number): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const nr = row + r;
      const nc = col + c;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false;
      if (board[nr][nc]) return false;
    }
  }
  return true;
}

export function placePiece(board: Board, piece: Piece): Board {
  const next = board.map((r) => [...r]);
  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (piece.matrix[r][c]) {
        next[piece.row + r][piece.col + c] = piece.shapeId;
      }
    }
  }
  return next;
}

export function clearLines(board: Board): { board: Board; cleared: number; clearedRows: number[] } {
  const clearedRows: number[] = [];
  const remaining: Cell[][] = [];

  for (let r = 0; r < board.length; r++) {
    if (board[r].every((c) => c !== 0)) {
      clearedRows.push(r);
    } else {
      remaining.push([...board[r]]);
    }
  }

  const cleared = ROWS - remaining.length;
  while (remaining.length < ROWS) {
    remaining.unshift(Array(COLS).fill(0));
  }

  return { board: remaining, cleared, clearedRows };
}

/**
 * Rotate a shape matrix 90° clockwise.
 */
export function rotateMatrix(matrix: Shape): Shape {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: Shape = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
}

/**
 * Try to rotate a piece on the board. Returns the rotated piece if valid,
 * or the original if rotation is blocked (with wall-kick attempts).
 */
export function tryRotate(board: Board, piece: Piece): Piece {
  // O-piece doesn't rotate
  if (piece.shapeId === 2) return piece;

  const rotated = rotateMatrix(piece.matrix);

  // Try at current position
  if (canPlace(board, rotated, piece.row, piece.col)) {
    return { ...piece, matrix: rotated };
  }

  // Wall-kick: try shifting left/right by 1
  for (const offset of [-1, 1, -2, 2]) {
    if (canPlace(board, rotated, piece.row, piece.col + offset)) {
      return { ...piece, matrix: rotated, col: piece.col + offset };
    }
  }

  return piece;
}

/**
 * Find the ghost (drop preview) row for a piece.
 */
export function ghostRow(board: Board, piece: Piece): number {
  let row = piece.row;
  while (canPlace(board, piece.matrix, row + 1, piece.col)) {
    row++;
  }
  return row;
}

/**
 * Check if the board is topped out (pieces stacked to top).
 */
export function isGameOver(board: Board): boolean {
  return board[0].some((c) => c !== 0);
}
