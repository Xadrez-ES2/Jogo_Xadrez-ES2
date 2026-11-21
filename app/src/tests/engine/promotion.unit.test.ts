import { describe, expect, test } from 'vitest';
import type { Color, GameState, PromotionPieceType, Square } from '../../engine';
import { applyMove, promotePawn } from '../../engine/game/applyMove';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen } from './engineTestHelpers';

const noCastling = { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false };
function position(fen: string, turn: Color, pendingPromotion: Square | null, halfmoveClock = 0): GameState {
  return {
    board: boardFromFen(fen), turn, pendingPromotion,
    internal: { castling: { ...noCastling }, enPassant: null, halfmoveClock, fullmoveNumber: 12 },
  };
}

describe('promoção', () => {
  const whitePending = position('P6k/8/8/8/8/8/8/7K', 'w', [0, 0]);
  const blackPending = position('7k/8/8/8/8/8/8/p6K', 'b', [7, 0]);

  test.each<{
    description: string; state: GameState; choice: PromotionPieceType;
    expectedFen: string; nextTurn: Color; fullmove: number;
  }>([
    { description: 'peão branco a dama', state: whitePending, choice: 'q',
      expectedFen: 'Q6k/8/8/8/8/8/8/7K', nextTurn: 'b', fullmove: 12 },
    { description: 'peão preto a torre', state: blackPending, choice: 'r',
      expectedFen: '7k/8/8/8/8/8/8/r6K', nextTurn: 'w', fullmove: 13 },
    { description: 'peão branco a bispo', state: whitePending, choice: 'b',
      expectedFen: 'B6k/8/8/8/8/8/8/7K', nextTurn: 'b', fullmove: 12 },
    { description: 'peão preto a cavalo', state: blackPending, choice: 'n',
      expectedFen: '7k/8/8/8/8/8/8/n6K', nextTurn: 'w', fullmove: 13 },
  ])('promove $description na última fileira', ({ state, choice, expectedFen, nextTurn, fullmove }) => {
    const pending = structuredClone(state);
    const promoted = promotePawn(pending, choice);
    expect(boardToFen(promoted.board)).toBe(expectedFen);
    expect(promoted.pendingPromotion).toBeNull();
    expect(promoted.turn).toBe(nextTurn);
    expect(promoted.internal.fullmoveNumber).toBe(fullmove);
    expect(pending).toEqual(state);
  });
});

test('avanço do peão preto adia também o incremento do lance completo', () => {
  const state = position('7k/8/8/8/8/8/p7/7K', 'b', null, 99);
  const snapshot = structuredClone(state);
  const pending = applyMove(state, { from: [6, 0], to: [7, 0] });
  expect(boardToFen(pending.board)).toBe('7k/8/8/8/8/8/8/p6K');
  expect(pending.pendingPromotion).toEqual([7, 0]);
  expect(pending.turn).toBe('b');
  expect(pending.internal.fullmoveNumber).toBe(12);
  expect(pending.internal.halfmoveClock).toBe(0);
  expect(state).toEqual(snapshot);
});

test('solicitar promocao sem pendencia conserva o estado por valor', () => {
  const state = position('7k/P7/8/8/8/8/8/7K', 'w', null);
  const snapshot = structuredClone(state);
  expect(promotePawn(state, 'q')).toEqual(snapshot);
  expect(state).toEqual(snapshot);
});
