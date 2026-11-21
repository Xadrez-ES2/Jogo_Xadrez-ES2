import { expect, test } from 'vitest';
import type { GameState } from '../../engine';
import { getGameStatus } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { playLegalMove } from './engineTestHelpers';

test('jogada comum atinge 100 meio-lances e encerra automaticamente', () => {
  const state: GameState = {
    board: boardFromFen('7k/8/8/8/8/8/8/R3K3'),
    turn: 'w',
    pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: null,
      halfmoveClock: 99,
      fullmoveNumber: 75,
    },
  };
  const snapshot = structuredClone(state);
  expect(getGameStatus(state)).toBe('playing');

  const next = playLegalMove(state, { from: [7, 0], to: [6, 0] });

  expect(next.board).toEqual(boardFromFen('7k/8/8/8/8/8/R7/4K3'));
  expect(next.internal.halfmoveClock).toBe(100);
  expect(next.turn).toBe('b');
  expect(getGameStatus(next)).toBe('fifty-moves');
  expect(state).toEqual(snapshot);
});
