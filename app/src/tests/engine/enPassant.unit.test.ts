import { expect, test } from 'vitest';
import type { Color, GameState, Square } from '../../engine';
import { getLegalMoves } from '../../engine/moves/legalMoves';
import { boardFromFen } from '../../engine/board/notation_for_test';

function position(fen: string, turn: Color, enPassant: Square | null): GameState {
  return {
    board: boardFromFen(fen), turn, pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant, halfmoveClock: 0, fullmoveNumber: 8,
    },
  };
}

test.each([
  ['peão branco com alvo em a6', '4k3/8/8/pP6/8/8/8/4K3', 'w', [3, 1], [2, 0]],
  ['peão preto com alvo em h3', '4k3/8/8/8/6pP/8/8/4K3', 'b', [4, 6], [5, 7]],
] as const)('%s só captura en passant enquanto há oportunidade', (_, fen, color, from, target) => {
  const state = position(fen, color, target);
  const snapshot = structuredClone(state);
  const capture = { from, to: target };

  expect(getLegalMoves(state)).toContainEqual(capture);
  expect(getLegalMoves({ ...state, internal: { ...state.internal, enPassant: null } })).not.toContainEqual(capture);
  expect(state).toEqual(snapshot);
});

test('en passant é ilegal quando expõe o rei preto à torre', () => {
  const capture = { from: [4, 1], to: [5, 2] } as const;
  const state = position('7K/8/8/8/kpP4R/8/8/8', 'b', capture.to);
  const withoutRook = position('7K/8/8/8/kpP5/8/8/8', 'b', capture.to);
  const snapshot = structuredClone(state);
  const legal = getLegalMoves(state);

  expect(legal).not.toContainEqual(capture);
  expect(legal).toContainEqual({ from: capture.from, to: [5, 1] });
  expect(getLegalMoves(withoutRook)).toContainEqual(capture);
  expect(state).toEqual(snapshot);
});
