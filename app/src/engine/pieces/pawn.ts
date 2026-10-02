import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { isInside } from '../board/square';
import { getPiece } from '../board/board';

// Brancas sobem no tabuleiro (a linha diminui) e pretas descem (a linha aumenta).
// O en passant nao entra aqui (fica em special/enPassant.ts), e a promocao
// e tratada ao aplicar a jogada, quando o peao chega na ultima linha.
export class PawnStrategy implements PieceStrategy {
  moves(board: Board, from: Square): Square[] {
    const pawn = getPiece(board, from);
    if (pawn === null) {
      return [];
    }

    const dir = pawn.color === 'w' ? -1 : 1;
    const startRow = pawn.color === 'w' ? 6 : 1;
    const [row, col] = from;
    const result: Square[] = [];

    // Para frente: uma casa, ou duas se ainda estiver na linha inicial.
    // O peao nao captura andando para frente, entao as casas precisam estar vazias.
    const oneRow = row + dir;
    if (isInside(oneRow, col) && board[oneRow][col] === null) {
      result.push([oneRow, col]);
      const twoRow = row + 2 * dir;
      if (row === startRow && board[twoRow][col] === null) {
        result.push([twoRow, col]);
      }
    }

    // Captura nas duas diagonais da frente, so se houver peca adversaria.
    for (const dCol of [-1, 1]) {
      const c = col + dCol;
      if (!isInside(oneRow, c)) {
        continue;
      }
      const target = board[oneRow][c];
      if (target !== null && target.color !== pawn.color) {
        result.push([oneRow, c]);
      }
    }
    return result;
  }
}
