import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { isInside } from '../board/square';
import { getPiece } from '../board/board';

export const KNIGHT_JUMPS: readonly [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

export class KnightStrategy implements PieceStrategy {
  // Pode parar em casa vazia ou com peca adversaria (captura)
  moves(board: Board, from: Square): Square[] {
    const knight = getPiece(board, from);
    if (knight === null) {
      return [];
    }

    const result: Square[] = [];
    for (const [dRow, dCol] of KNIGHT_JUMPS) {
      const row = from[0] + dRow;
      const col = from[1] + dCol;
      if (!isInside(row, col)) {
        continue;
      }
      const target = board[row][col];
      if (target === null || target.color !== knight.color) {
        result.push([row, col]);
      }
    }
    return result;
  }
}
