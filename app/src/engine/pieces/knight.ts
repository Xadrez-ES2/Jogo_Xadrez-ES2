import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { jump } from './jump';

// Os 8 saltos do cavalo, como [variacao de linha, variacao de coluna].
// Exportado para ser reaproveitado na deteccao de casa atacada.
export const KNIGHT_MOVES: readonly [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

export class KnightStrategy implements PieceStrategy {
  moves(board: Board, from: Square): Square[] {
    return jump(board, from, KNIGHT_JUMPS);
  }
}
