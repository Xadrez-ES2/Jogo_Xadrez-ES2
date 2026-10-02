import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { isInside } from '../board/square';
import { getPiece } from '../board/board';

// Os 8 passos do rei (uma casa em qualquer direcao),
// Exportado para ser reaproveitado na deteccao de casa atacada.
export const KING_MOVES: readonly [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

// Estrategia de movimento do rei.
// O roque nao entra aqui
export class KingStrategy implements PieceStrategy {
  moves(board: Board, from: Square): Square[] {
    const king = getPiece(board, from);
    if (king === null) {
      return [];
    }

    const result: Square[] = [];
    for (const [dRow, dCol] of KING_STEPS) {
      const row = from[0] + dRow;
      const col = from[1] + dCol;
      if (!isInside(row, col)) {
        continue;
      }
      const target = board[row][col];
      if (target === null || target.color !== king.color) {
        result.push([row, col]);
      }
    }
    return result;
  }
}
