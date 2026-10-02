import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { jump } from './jump';

// Os 8 passos do rei (uma casa em qualquer direcao),
// como [variacao de linha, variacao de coluna].
// Exportado para ser reaproveitado na deteccao de casa atacada.
export const KING_STEPS: readonly [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

// O roque nao entra aqui, e as casas atacadas sao descartadas depois, pelo filtro de jogadas legais.
export class KingStrategy implements PieceStrategy {
  moves(board: Board, from: Square): Square[] {
    return jump(board, from, KING_STEPS);
  }
}
