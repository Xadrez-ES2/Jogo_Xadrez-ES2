import type { Board, Square } from '../types';

// Interface do padrao Strategy para o movimento das pecas.
// Cada peca implementa sua propria forma de calcular os destinos,
// e quem usa as pecas chama moves() sem saber qual peca e.
export interface PieceStrategy {
  // Retorna as casas para onde a peca que esta em "from" pode ir.
  moves(board: Board, from: Square): Square[];
}
