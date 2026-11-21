import { describe, expect, test } from 'vitest';
import type { GameState, Square } from '../../engine';
import { isThreefoldRepetition } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { getPositionKey } from '../../engine/status/repetition';

function position(fen = 'r3k2r/8/8/8/8/8/8/R3K2R'): GameState {
  return {
    board: boardFromFen(fen), turn: 'w', pendingPromotion: null,
    internal: { castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false }, enPassant: null, halfmoveClock: 0, fullmoveNumber: 1 },
  };
}

describe('identidade da posição', () => {
  test('jogador da vez diferencia a mesma disposição', () => {
    const state = position();
    expect(getPositionKey({ ...state, turn: 'b' })).not.toBe(getPositionKey(state));
  });

  test.each([
    { description: 'en passant legal diferencia a posição', fen: '4k3/8/8/2pP4/8/8/8/4K3', target: [2, 2], different: true },
    { description: 'alvo de en passant sem peão capturador mantém a mesma posição', fen: '4k3/8/8/2p5/8/8/8/4K3', target: [2, 2], different: false },
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

test('três posições antigas não implicam repetição da posição atual', () => {
  const state = position();
  const key = getPositionKey({ ...state, turn: 'b' });
  expect(isThreefoldRepetition({ ...state, internal: { ...state.internal, positionHistory: [key, key, key] } })).toBe(false);
});
