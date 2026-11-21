import { expect, test } from 'vitest';
import type { GameState, Move } from '../../engine';
import { getLegalMoves } from '../../engine/moves/legalMoves';
import { boardFromFen } from '../../engine/board/notation_for_test';

test('peão branco com alvo em a6 só captura en passant enquanto há oportunidade', () => {
  const capture: Move = { from: [3, 1], to: [2, 0] };
  const state: GameState = {
    board: boardFromFen('4k3/8/8/pP6/8/8/8/4K3'),
    turn: 'w',
    pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: capture.to,
      halfmoveClock: 0,
      fullmoveNumber: 8,
    },
  };
  const snapshot = structuredClone(state);

  expect(getLegalMoves(state)).toContainEqual(capture);
  expect(getLegalMoves({ ...state, internal: { ...state.internal, enPassant: null } })).not.toContainEqual(capture);
  expect(state).toEqual(snapshot);
});
