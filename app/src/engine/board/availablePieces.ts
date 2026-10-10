import type { Board, Color, Piece, Square } from '../types';

// Retorna as pecas da cor que ainda estao em jogo, cada uma com a sua casa.
// O tabuleiro ja guarda essas pecas: a funcao so as reune numa lista.
// Usos: contagem de material (IA) e empate por falta de pecas.
export function getAvailablePieces(board: Board, color: Color): { piece: Piece; square: Square }[] {
  const result: { piece: Piece; square: Square }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece !== null && piece.color === color) {
        result.push({ piece, square: [row, col] });
      }
    }
  }
  return result;
}
