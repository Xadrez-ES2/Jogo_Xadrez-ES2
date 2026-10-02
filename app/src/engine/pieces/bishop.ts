import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { slide } from './slide';

// As 4 diagonais do bispo, como [variacao de linha, variacao de coluna].
// Exportado para a dama e para a deteccao de casa atacada.
export const BISHOP_DIRECTIONS: readonly [number, number][] = [
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];

// Estrategia de movimento do bispo.
export class BishopStrategy implements PieceStrategy {
  moves(board: Board, from: Square): Square[] {
    return slide(board, from, BISHOP_DIRECTIONS);
  }
}
