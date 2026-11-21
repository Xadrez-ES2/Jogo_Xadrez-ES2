import { describe, expect, test } from 'vitest';
import type { GameState, Square } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { getPositionKey } from '../../engine/status/repetition';

function position(fen: string): GameState {
  return {
    board: boardFromFen(fen), turn: 'w', pendingPromotion: null,
    internal: { castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false }, enPassant: null, halfmoveClock: 0, fullmoveNumber: 1 },
  };
}

describe('identidade da posição', () => {
  test.each([
    { description: 'en passant legal diferencia a posição', fen: '4k3/8/8/2pP4/8/8/8/4K3', target: [2, 2], different: true },
    { description: 'en passant que expõe o rei ao xeque mantém a mesma posição', fen: '4k3/8/8/KPp4r/8/8/8/8', target: [2, 2], different: false },
  ] satisfies { description: string; fen: string; target: Square; different: boolean }[])(
    '$description', ({ fen, target, different }) => {
      const state = position(fen);
      const withTarget = { ...state, internal: { ...state.internal, enPassant: target } };
      if (different) expect(getPositionKey(withTarget)).not.toBe(getPositionKey(state));
      else expect(getPositionKey(withTarget)).toBe(getPositionKey(state));
    },
  );
});
