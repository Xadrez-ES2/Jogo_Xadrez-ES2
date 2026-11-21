import { expect, test } from 'vitest';
import type { Color, GameState } from '../../engine';
import { applyMove } from '../../engine/game/applyMove';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { allCastlingRights, boardToFen } from './engineTestHelpers';

const noRights = { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false };

function position(fen: string, turn: Color, castling: GameState['internal']['castling']): GameState {
  return { board: boardFromFen(fen), turn, pendingPromotion: null,
    internal: { castling, enPassant: null, halfmoveClock: 7, fullmoveNumber: 4 } };
}

// Legal fixture moves worked independently; only applyMove is observed here.
// The public generation/application interaction is covered by integration suites.
test.each([
  { description: 'roque menor das brancas', turn: 'w', from: [7,4], to: [7,6],
    after: 'r3k2r/8/8/8/8/8/8/R4RK1',
    rights: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: true, blackQueenSide: true }, fullmove: 4 },
  { description: 'roque maior das pretas', turn: 'b', from: [0,4], to: [0,2],
    after: '2kr3r/8/8/8/8/8/8/R3K2R',
    rights: { whiteKingSide: true, whiteQueenSide: true, blackKingSide: false, blackQueenSide: false }, fullmove: 5 },
] as const)('$description desloca rei e torre e revoga somente os direitos do rei movido', ({ turn, from, to, after, rights, fullmove }) => {
  const state = position('r3k2r/8/8/8/8/8/8/R3K2R', turn, allCastlingRights);
  const snapshot = structuredClone(state);
  const next = applyMove(state, { from, to });
  expect(boardToFen(next.board)).toBe(after);
  expect(next.internal.castling).toEqual(rights);
  expect(next.internal.halfmoveClock).toBe(8);
  expect(next.internal.fullmoveNumber).toBe(fullmove);
  expect(next.turn).toBe(turn === 'w' ? 'b' : 'w');
  expect(next.pendingPromotion).toBeNull();
  expect(next.internal.enPassant).toBeNull();
  expect(next.internal.positionHistory).toHaveLength(2);
  expect(state).toEqual(snapshot);
});

test.each([
  { description: 'torre branca captura na coluna a', turn: 'w', from: [7,0], to: [0,0], after: 'R3k2r/8/8/8/8/8/8/4K2R',
    rights: { whiteKingSide: true, whiteQueenSide: false, blackKingSide: true, blackQueenSide: false } },
  { description: 'torre preta captura na coluna h', turn: 'b', from: [0,7], to: [7,7], after: 'r3k3/8/8/8/8/8/8/R3K2r',
    rights: { whiteKingSide: false, whiteQueenSide: true, blackKingSide: false, blackQueenSide: true } },
] as const)('$description e revoga os direitos da torre movida e da capturada', ({ turn, from, to, after, rights }) => {
  const state = position('r3k2r/8/8/8/8/8/8/R3K2R', turn, allCastlingRights);
  const snapshot = structuredClone(state);
  const next = applyMove(state, { from, to });
  expect(boardToFen(next.board)).toBe(after);
  expect(next.internal.castling).toEqual(rights);
  expect(next.internal.halfmoveClock).toBe(0);
  expect(state).toEqual(snapshot);
});

test('avanço duplo registra a casa ultrapassada como alvo en passant', () => {
  const state = position('4k3/4p3/8/8/8/8/8/4K3', 'b', noRights);
  const snapshot = structuredClone(state);
  const next = applyMove(state, { from: [1, 4], to: [3, 4] });
  expect(boardToFen(next.board)).toBe('4k3/8/8/4p3/8/8/8/4K3');
  expect(next.internal.enPassant).toEqual([2, 4]);
  expect(next.internal.halfmoveClock).toBe(0);
  expect(state).toEqual(snapshot);
});
