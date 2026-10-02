import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { slide } from './slide';

// As 4 direcoes da torre (cima, baixo, esquerda, direita),
// como [variacao de linha, variacao de coluna].
// Exportado para a dama e para a deteccao de casa atacada.
export const ROOK_MOVES: readonly [number, number][] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

// Estrategia de movimento da torre.
export class RookStrategy implements PieceStrategy {
  moves(board: Board, from: Square): Square[] {
    return slide(board, from, ROOK_MOVES);
  }
}
