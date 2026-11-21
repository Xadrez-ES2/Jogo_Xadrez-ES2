import { expect, test } from 'vitest';
import type { GameState, Move } from '../../engine';
import { applyMove, getGameStatus, getLegalMoves, promotePawn } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen } from './engineTestHelpers';

test('promoção do peão preto a cavalo conclui exatamente um meio-lance', () => {
  const initial: GameState = {
    board: boardFromFen('7k/8/8/8/8/8/p7/7K'),
    turn: 'b',
    pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: null,
      halfmoveClock: 99,
      fullmoveNumber: 12,
    },
  };
  const original = structuredClone(initial);
  const move: Move = { from: [6, 0], to: [7, 0] };
  expect(getGameStatus(initial)).toBe('playing');
  expect(getLegalMoves(initial)).toContainEqual(move);

  const pending = applyMove(initial, move);
  const pendingSnapshot = structuredClone(pending);
  expect(boardToFen(pending.board)).toBe('7k/8/8/8/8/8/8/p6K');
  expect(pending.pendingPromotion).toEqual(move.to);
  expect(pending.turn).toBe('b');
  expect(pending.internal.fullmoveNumber).toBe(12);
  expect(pending.internal.halfmoveClock).toBe(0);
  // Sem histórico recebido, a API registra a posição inicial, mas não a incompleta.
  expect(pending.internal.positionHistory).toHaveLength(1);
  expect(getLegalMoves(pending)).toEqual([]);
  expect(getGameStatus(pending)).toBe('playing');
  expect(initial).toEqual(original);

  const completed = promotePawn(pending, 'n');
  expect(boardToFen(completed.board)).toBe('7k/8/8/8/8/8/8/n6K');
  expect(completed.pendingPromotion).toBeNull();
  expect(completed.turn).toBe('w');
  expect(completed.internal.fullmoveNumber).toBe(13);
  expect(completed.internal.halfmoveClock).toBe(0);
  expect(completed.internal.positionHistory).toHaveLength(2);
  expect(completed.internal.positionHistory?.slice(0, 1)).toEqual(pendingSnapshot.internal.positionHistory);
  expect(completed.internal.positionHistory?.[1]).not.toBe(completed.internal.positionHistory?.[0]);
  expect(getGameStatus(completed)).toBe('insufficient-material');
  expect(pending).toEqual(pendingSnapshot);
  expect(initial).toEqual(original);

  // Uma escolha diferente revelaria uma troca indevida da peça após a conclusão.
  const finalSnapshot = structuredClone(completed);
  expect(promotePawn(completed, 'q')).toEqual(finalSnapshot);
  expect(completed).toEqual(finalSnapshot);
});
