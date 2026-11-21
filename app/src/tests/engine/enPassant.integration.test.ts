import { expect, test } from 'vitest';
import type { GameState, Move } from '../../engine';
import { getLegalMoves } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen, playLegalMove } from './engineTestHelpers';

function expectHistoryExtension(before: GameState, after: GameState, length: number) {
  expect(after.internal.positionHistory).toHaveLength(length);
  if (before.internal.positionHistory) {
    expect(after.internal.positionHistory?.slice(0, -1)).toEqual(before.internal.positionHistory);
  }
}

test('captura en passant expira antes de o mesmo peão voltar a jogar', () => {
  const initial: GameState = {
    board: boardFromFen('4k3/p7/8/8/4p3/8/3P3P/4K3'),
    turn: 'w',
    pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: null,
      halfmoveClock: 37,
      fullmoveNumber: 12,
    },
  };
  const initialSnapshot = structuredClone(initial);
  const capture: Move = { from: [4, 4], to: [5, 3] };
  expect(getLegalMoves(initial)).not.toContainEqual(capture);

  const offered = playLegalMove(initial, { from: [6, 3], to: [4, 3] });
  const offeredSnapshot = structuredClone(offered);
  expect(boardToFen(offered.board)).toBe('4k3/p7/8/8/3Pp3/8/7P/4K3');
  expect(offered.turn).toBe('b');
  expect(offered.internal).toMatchObject({ enPassant: capture.to, halfmoveClock: 0, fullmoveNumber: 12 });
  expectHistoryExtension(initial, offered, 2);
  expect(getLegalMoves(offered)).toContainEqual(capture);

  const alternative = playLegalMove(offered, { from: [0, 4], to: [0, 5] });
  expect(alternative.internal.enPassant).toBeNull();
  expectHistoryExtension(offered, alternative, 3);

  const expired = playLegalMove(alternative, { from: [7, 4], to: [7, 5] });
  expect(boardToFen(expired.board)).toBe('5k2/p7/8/8/3Pp3/8/7P/5K2');
  expect(expired.turn).toBe('b');
  expect(expired.board[4][4]).toEqual({ type: 'p', color: 'b' });
  expect(expired.board[4][3]).toEqual({ type: 'p', color: 'w' });
  expect(expired.pendingPromotion).toBeNull();
  expect(expired.internal).toMatchObject({ enPassant: null, halfmoveClock: 2, fullmoveNumber: 13 });
  const legal = getLegalMoves(expired);
  expect(legal).not.toContainEqual(capture);
  expect(legal).toContainEqual({ from: [4, 4], to: [5, 4] });
  expectHistoryExtension(alternative, expired, 4);
  expect(initial).toEqual(initialSnapshot);
  expect(offered).toEqual(offeredSnapshot);
});
