import { expect, test } from 'vitest';
import type { Color, GameState } from '../../engine';
import { getLegalMoves } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen, playLegalMove } from './engineTestHelpers';

function position(fen: string, turn: Color): GameState {
  return {
    board: boardFromFen(fen), turn, pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: null, halfmoveClock: 37, fullmoveNumber: 12,
    },
  };
}

const captureScenario = {
  color: 'w', initial: '4k3/3p3p/8/4P3/8/8/P7/4K3', turn: 'b',
  double: { from: [1, 3], to: [3, 3] }, capture: { from: [3, 4], to: [2, 3] },
  offered: '4k3/7p/8/3pP3/8/8/P7/4K3', captured: '4k3/7p/3P4/8/8/8/P7/4K3',
  fullAfterDouble: 13, fullAfterCapture: 13,
} as const;

const expiryScenario = {
  color: 'b', initial: '4k3/p7/8/8/4p3/8/3P3P/4K3', turn: 'w',
  double: { from: [6, 3], to: [4, 3] }, capture: { from: [4, 4], to: [5, 3] },
  offered: '4k3/p7/8/8/3Pp3/8/7P/4K3',
  adjacent: [4, 3], fullAfterDouble: 12,
  alternative: { from: [0, 4], to: [0, 5] }, reply: { from: [7, 4], to: [7, 5] },
  expired: '5k2/p7/8/8/3Pp3/8/7P/5K2', fullAfterExpiry: 13, advance: { from: [4, 4], to: [5, 4] },
} as const;

function expectHistoryExtension(before: GameState, after: GameState, length: number) {
  expect(after.internal.positionHistory).toHaveLength(length);
  if (before.internal.positionHistory) {
    expect(after.internal.positionHistory?.slice(0, -1)).toEqual(before.internal.positionHistory);
  }
}

function offerEnPassant(initial: GameState, data: typeof captureScenario | typeof expiryScenario): GameState {
  expect(getLegalMoves(initial)).not.toContainEqual(data.capture);
  const offered = playLegalMove(initial, data.double);
  expect(boardToFen(offered.board)).toBe(data.offered);
  expect(offered.turn).toBe(data.color);
  expect(offered.internal).toMatchObject({ enPassant: data.capture.to, halfmoveClock: 0, fullmoveNumber: data.fullAfterDouble });
  expectHistoryExtension(initial, offered, 2);
  return offered;
}

test('avanço duplo permite gerar e aplicar a captura en passant', () => {
  const data = captureScenario;
  const initial = position(data.initial, data.turn);
  const initialSnapshot = structuredClone(initial);
  const offered = offerEnPassant(initial, data);
  const captured = playLegalMove(offered, data.capture);

  expect(boardToFen(captured.board)).toBe(data.captured);
  expect(captured.turn).toBe(data.turn);
  expect(captured.pendingPromotion).toBeNull();
  expect(captured.internal).toMatchObject({ castling: initialSnapshot.internal.castling, enPassant: null, halfmoveClock: 0, fullmoveNumber: data.fullAfterCapture });
  expectHistoryExtension(offered, captured, 3);
  expect(initial).toEqual(initialSnapshot);
});

test('captura en passant expira antes de o mesmo peão voltar a jogar', () => {
  const data = expiryScenario;
  const initial = position(data.initial, data.turn);
  const initialSnapshot = structuredClone(initial);
  const offered = offerEnPassant(initial, data);
  const offeredSnapshot = structuredClone(offered);
  expect(getLegalMoves(offered)).toContainEqual(data.capture);

  const alternative = playLegalMove(offered, data.alternative);
  expect(alternative.internal.enPassant).toBeNull();
  expectHistoryExtension(offered, alternative, 3);

  const expired = playLegalMove(alternative, data.reply);
  expect(boardToFen(expired.board)).toBe(data.expired);
  expect(expired.turn).toBe(data.color);
  expect(expired.board[data.capture.from[0]][data.capture.from[1]]).toEqual({ type: 'p', color: data.color });
  expect(expired.board[data.adjacent[0]][data.adjacent[1]]).toEqual({ type: 'p', color: data.turn });
  expect(expired.pendingPromotion).toBeNull();
  expect(expired.internal).toMatchObject({ enPassant: null, halfmoveClock: 2, fullmoveNumber: data.fullAfterExpiry });
  const legal = getLegalMoves(expired);
  expect(legal).not.toContainEqual(data.capture);
  expect(legal).toContainEqual(data.advance);
  expectHistoryExtension(alternative, expired, 4);
  expect(initial).toEqual(initialSnapshot);
  expect(offered).toEqual(offeredSnapshot);
});
