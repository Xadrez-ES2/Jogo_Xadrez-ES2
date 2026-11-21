import { expect } from 'vitest';
import type { Board, GameState, Move } from '../../engine';
import { applyMove, getLegalMoves } from '../../engine';

export const allCastlingRights = {
  whiteKingSide: true, whiteQueenSide: true,
  blackKingSide: true, blackQueenSide: true,
};

/** Select from legal moves before applying; preserve the input by value. */
export function playLegalMove(state: GameState, chosen: Move): GameState {
  const snapshot = structuredClone(state);
  expect(getLegalMoves(state)).toContainEqual(chosen);
  const next = applyMove(state, chosen);
  expect(state).toEqual(snapshot);
  return next;
}

/** Readable observation only: expected positions must be independent literals. */
export function boardToFen(board: Board): string {
  return board.map((rank) => {
    let result = '';
    let empties = 0;
    for (const piece of rank) {
      if (piece === null) { empties++; continue; }
      if (empties) { result += String(empties); empties = 0; }
      result += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
    }
    return result + (empties ? String(empties) : '');
  }).join('/');
}
