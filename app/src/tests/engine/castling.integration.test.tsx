import { describe, expect, test } from 'vitest';
import type { Color, GameState, Square } from '../../engine';
import { getLegalMoves } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { allCastlingRights, boardToFen, playLegalMove } from './engineTestHelpers';

function position(fen: string, turn: Color): GameState {
  return {
    board: boardFromFen(fen),
    turn,
    pendingPromotion: null,
    internal: {
      castling: { ...allCastlingRights },
      enPassant: null,
      halfmoveClock: 7,
      fullmoveNumber: 4,
    },
  };
}

function move(from: Square, to: Square) {
  return { from, to };
}

describe('integracao: perda permanente dos direitos de roque', () => {
  test.each([
    {
      description: 'torre branca do roque maior', turn: 'w', row: 7, col: 0, toRow: 6,
      expected: { ...allCastlingRights, whiteQueenSide: false }, remainingCastles: [move([7, 4], [7, 6])],
    },
    {
      description: 'rei preto', turn: 'b', row: 0, col: 4, toRow: 1,
      expected: { ...allCastlingRights, blackKingSide: false, blackQueenSide: false }, remainingCastles: [],
    },
  ] as const)('a saída e o retorno da peça não restauram os direitos ($description)', ({ turn, row, col, toRow, expected, remainingCastles }) => {
    const fen = 'r3k2r/8/1n6/8/8/1N6/8/R3K2R';
    const initial = position(fen, turn);
    const snapshot = structuredClone(initial);
    const initialLegal = getLegalMoves(initial);
    expect(initialLegal).toContainEqual(move([row, 4], [row, 2]));
    expect(initialLegal).toContainEqual(move([row, 4], [row, 6]));
    const waitingFrom: Square = turn === 'w' ? [2, 1] : [5, 1];
    const waitingTo: Square = turn === 'w' ? [4, 2] : [3, 2];
    const first = playLegalMove(initial, move([row, col], [toRow, col]));
    expect(first.internal.castling).toEqual(expected);
    const firstSnapshot = structuredClone(first);
    let state = playLegalMove(first, move(waitingFrom, waitingTo));
    state = playLegalMove(state, move([toRow, col], [row, col]));
    state = playLegalMove(state, move(waitingTo, waitingFrom));
    expect(boardToFen(state.board)).toBe(fen);
    expect(state.internal.castling).toEqual(expected);
    expect(state.turn).toBe(turn);
    expect(state.internal.halfmoveClock).toBe(11);
    expect(state.internal.fullmoveNumber).toBe(6);
    expect(state.internal.positionHistory).toHaveLength(5);
    expect(state.internal.positionHistory?.at(-1)).not.toBe(state.internal.positionHistory?.[0]);
    const castles = getLegalMoves(state).filter(({ from, to }) =>
      from[0] === row && from[1] === 4 && to[0] === row && Math.abs(to[1] - from[1]) === 2);
    expect(castles).toEqual(remainingCastles);
    expect(initial).toEqual(snapshot);
    expect(first).toEqual(firstSnapshot);
  });
});
