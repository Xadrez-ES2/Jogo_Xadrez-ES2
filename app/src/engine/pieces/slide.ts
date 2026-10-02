import type { Board, Square } from '../types';
import { isInside } from '../board/square';
import { getPiece } from '../board/board';

// Movimento usado pela torre, pelo bispo e pela dama.
// Em cada direcao, anda casa por casa ate sair do tabuleiro ou encontrar
// uma peca. Se a peca for adversaria, a casa entra no resultado (captura).
export function slide(
  board: Board,
  from: Square,
  directions: readonly [number, number][],
): Square[] {
  const piece = getPiece(board, from);
  if (piece === null) {
    return [];
  }

  const result: Square[] = [];
  for (const [dRow, dCol] of directions) {
    let row = from[0] + dRow;
    let col = from[1] + dCol;
    while (isInside(row, col)) {
      const target = board[row][col];
      if (target === null) {
        result.push([row, col]);
      } else {
        if (target.color !== piece.color) {
          result.push([row, col]);
        }
        break;
      }
      row += dRow;
      col += dCol;
    }
  }
  return result;
}
