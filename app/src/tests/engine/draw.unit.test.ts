import { describe, expect, test } from 'vitest';
import type { GameState } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { isFiftyMoveDraw, isInsufficientMaterial } from '../../engine/status/draw';

test('contador de 101 meio-lances ainda reconhece empate', () => {
  const state: GameState = {
    board: boardFromFen('7k/8/8/8/8/8/8/R3K3'),
    turn: 'w',
    pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: null,
      halfmoveClock: 101,
      fullmoveNumber: 50,
    },
  };
  const before = structuredClone(state);
  expect(isFiftyMoveDraw(state)).toBe(true);
  expect(state).toEqual(before);
});

describe('material insuficiente', () => {
  test.each([
    ['bispos adversários em casas claras', '2b1k3/8/8/8/8/8/8/4KB2', true],
    ['bispos adversários em cores de casas diferentes', '2b1k3/8/8/8/8/8/8/2B1K3', false],
  ] as const)('%s', (_description, fen, expected) => {
    const board = boardFromFen(fen);
    const before = structuredClone(board);
    expect(isInsufficientMaterial(board)).toBe(expected);
    expect(board).toEqual(before);
  });
});
