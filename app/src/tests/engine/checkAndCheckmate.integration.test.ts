import { expect, test } from 'vitest';
import type { GameState } from '../../engine';
import { getGameStatus, getLegalMoves } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen, playLegalMove } from './engineTestHelpers';

const noCastling = {
  whiteKingSide: false,
  whiteQueenSide: false,
  blackKingSide: false,
  blackQueenSide: false,
};

function positionInCheck(fen: string): GameState {
  return {
    board: boardFromFen(fen),
    turn: 'w',
    pendingPromotion: null,
    internal: {
      castling: { ...noCastling },
      enPassant: null,
      halfmoveClock: 17,
      fullmoveNumber: 1,
    },
  };
}

test('capturar a torre atacante resolve o xeque e reinicia a contagem', () => {
  const state = positionInCheck('k7/8/8/8/8/8/4r2R/4K3');
  expect(getGameStatus(state)).toBe('check');
  expect(getLegalMoves(state)).not.toContainEqual({ from: [6, 7], to: [5, 7] });

  const next = playLegalMove(state, { from: [6, 7], to: [6, 4] });
  expect(boardToFen(next.board)).toBe('k7/8/8/8/8/8/4R3/4K3');
  expect(next.turn).toBe('b');
  expect(next.internal.halfmoveClock).toBe(0);
  expect(getGameStatus(next)).toBe('playing');
  expect(getGameStatus({ ...next, turn: state.turn })).toBe('playing');
});
