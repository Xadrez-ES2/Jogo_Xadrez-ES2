import { expect, test } from 'vitest';
import type { Color, GameState, Move, Piece, Square } from '../../engine';
import { getLegalMoves } from '../../engine/moves/legalMoves';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { allCastlingRights } from './engineTestHelpers';

function position(turn: Color): GameState {
  return {
    board: boardFromFen('r3k2r/8/8/8/8/8/8/R3K2R'), turn, pendingPromotion: null,
    internal: { castling: { ...allCastlingRights }, enPassant: null, halfmoveClock: 7, fullmoveNumber: 4 },
  };
}

function withPiece(state: GameState, [row, col]: Square, piece: Piece | null): GameState {
  const board = state.board.map(rank => [...rank]);
  board[row][col] = piece;
  return { ...state, board };
}

function castle(row: number, col: number): Move {
  return { from: [row, 4], to: [row, col] };
}

test('ataque no destino g8 impede apenas o roque menor das pretas', () => {
  const state = withPiece(position('b'), [3, 6], { type: 'r', color: 'w' });
  const legal = getLegalMoves(state);
  expect(legal).not.toContainEqual(castle(0, 6));
  expect(legal).toContainEqual(castle(0, 2));
});

test('rei preto em xeque pode fugir, mas nenhum roque é permitido', () => {
  const state = withPiece(position('b'), [3, 4], { type: 'r', color: 'w' });
  const legal = getLegalMoves(state);
  expect(legal).toContainEqual(castle(0, 5));
  expect(legal).not.toContainEqual(castle(0, 2));
  expect(legal).not.toContainEqual(castle(0, 6));
});

test('ataque em b1 permite o roque maior das brancas', () => {
  const state = withPiece(position('w'), [3, 1], { type: 'r', color: 'b' });

  expect(getLegalMoves(state)).toContainEqual(castle(7, 2));
});
