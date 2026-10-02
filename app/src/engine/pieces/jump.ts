import type { Board, Square } from '../types';
import { isInside } from '../board/square';
import { getPiece } from '../board/board';

// Movimento usado pelo cavalo e pelo rei.
// Testa cada deslocamento uma unica vez: a casa entra no resultado se
// estiver no tabuleiro e estiver vazia ou com peca adversaria (captura).
export function jump(
  board: Board,
  from: Square,
  offsets: readonly [number, number][],
): Square[] {
  const piece = getPiece(board, from);
  if (piece === null) {
    return [];
  }

  const result: Square[] = [];
  for (const [dRow, dCol] of offsets) {
    const row = from[0] + dRow;
    const col = from[1] + dCol;
    if (!isInside(row, col)) {
      continue;
    }
    const target = board[row][col];
    if (target === null || target.color !== piece.color) {
      result.push([row, col]);
    }
  }
  return result;
}
