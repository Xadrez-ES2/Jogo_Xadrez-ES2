import type { Board, GameState, Piece } from '../engine';
import { getPiece } from '../engine';
import { PIECE_VALUES, CENTER_BONUS, PAWN_ADVANCE_BONUS } from './criteria';

// Pontos de uma peca na casa [row, col], sem olhar a cor.
function pieceScore(piece: Piece, row: number, col: number): number {
  let score = PIECE_VALUES[piece.type];

  if (piece.type === 'p' || piece.type === 'n' || piece.type === 'b') {
    score += CENTER_BONUS[row][col];
  }

  if (piece.type === 'p') {
    // Brancas comecam na linha 6 e sobem, pretas comecam na 1 e descem
    const advanced = piece.color === 'w' ? 6 - row : row - 1;
    score += advanced * PAWN_ADVANCE_BONUS;
  }
  return score;
}

// Avalia a posicao: positivo e bom para as brancas, negativo para as pretas.
export function evaluate(state: GameState): number {
  let total = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getPiece(state.board, [row, col]);
      if (piece === null) {
        continue;
      }
      const score = pieceScore(piece, row, col);
      total += piece.color === 'w' ? score : -score;
    }
  }
  return total;
}

// Enquanto a engine nao filtra xeque (#27), um rei pode ser capturado na busca.
// Quando isso acontece a partida acabou e a busca para nesse ramo.
export function isKingMissing(board: Board): boolean {
  let kings = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (getPiece(board, [row, col])?.type === 'k') {
        kings++;
      }
    }
  }
  return kings < 2;
}
