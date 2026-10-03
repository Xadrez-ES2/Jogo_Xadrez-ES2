import type { Board, Move } from '../types';
import { copyBoard, getPiece } from './board';

// Move a peca de "from" para "to" e devolve um tabuleiro novo.
// Se houver peca adversaria em "to", ela e substituida (captura).
// O tabuleiro recebido nao e alterado.

export function movePiece(board: Board, move: Move): Board {
  const result = copyBoard(board);
  const piece = getPiece(board, move.from);
  result[move.to[0]][move.to[1]] = piece;
  result[move.from[0]][move.from[1]] = null;
  return result;
}
