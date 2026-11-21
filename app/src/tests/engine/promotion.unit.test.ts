import { expect, test } from 'vitest';
import type { GameState } from '../../engine';
import { promotePawn } from '../../engine/game/applyMove';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen } from './engineTestHelpers';

test('promove peão branco a dama na última fileira', () => {
  const pending: GameState = {
    board: boardFromFen('P6k/8/8/8/8/8/8/7K'),
    turn: 'w',
    pendingPromotion: [0, 0],
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: null,
      halfmoveClock: 0,
      fullmoveNumber: 12,
    },
  };
  const snapshot = structuredClone(pending);

  const promoted = promotePawn(pending, 'q');

  expect(boardToFen(promoted.board)).toBe('Q6k/8/8/8/8/8/8/7K');
  expect(promoted.pendingPromotion).toBeNull();
  expect(promoted.turn).toBe('b');
  expect(promoted.internal.fullmoveNumber).toBe(12);
  expect(pending).toEqual(snapshot);
});
