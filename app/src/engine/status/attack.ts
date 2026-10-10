import type { Board, Color, PieceType, Square } from '../types';
import { isInside } from '../board/square';
import { findKing } from '../board/board';
import { KNIGHT_MOVES } from '../pieces/knight';
import { KING_MOVES } from '../pieces/king';
import { ROOK_MOVES } from '../pieces/rook';
import { BISHOP_MOVES } from '../pieces/bishop';

// Verifica se em [row, col] existe uma peca da cor "by" de um dos tipos pedidos.
function hasPiece(board: Board, row: number, col: number, by: Color, types: PieceType[]): boolean {
  if (!isInside(row, col)) {
    return false;
  }
  const piece = board[row][col];
  return piece !== null && piece.color === by && types.includes(piece.type);
}

// Desliza a partir da casa em cada direcao e verifica se a primeira peca
// encontrada e da cor "by" e de um dos tipos pedidos.
function attackedBySlider(board: Board, square: Square, by: Color, directions: readonly [number, number][], types: PieceType[]): boolean {
  for (const [dRow, dCol] of directions) {
    let row = square[0] + dRow;
    let col = square[1] + dCol;
    while (isInside(row, col)) {
      const piece = board[row][col];
      if (piece !== null) {
        if (piece.color === by && types.includes(piece.type)) {
          return true;
        }
        break;
      }
      row += dRow;
      col += dCol;
    }
  }
  return false;
}

// Verifica se alguma peca da cor "by" ataca a casa.
// Olha a partir da casa, como se ali houvesse cada tipo de peca.
export function isSquareAttacked(board: Board, square: Square, by: Color): boolean {
  const [row, col] = square;

  for (const [dRow, dCol] of KNIGHT_MOVES) {
    if (hasPiece(board, row + dRow, col + dCol, by, ['n'])) {
      return true;
    }
  }
  for (const [dRow, dCol] of KING_MOVES) {
    if (hasPiece(board, row + dRow, col + dCol, by, ['k'])) {
      return true;
    }
  }

  // O peao branco ataca para cima, entao estaria uma linha abaixo da casa.
  // O peao preto ataca para baixo, entao estaria uma linha acima.
  const pawnRow = by === 'w' ? row + 1 : row - 1;
  if (hasPiece(board, pawnRow, col - 1, by, ['p']) || hasPiece(board, pawnRow, col + 1, by, ['p'])) {
    return true;
  }

  return attackedBySlider(board, square, by, ROOK_MOVES, ['r', 'q'])
    || attackedBySlider(board, square, by, BISHOP_MOVES, ['b', 'q']);
}

// Verifica se o rei da cor esta atacado (em xeque).
// Sem rei no tabuleiro (posicoes de teste), considera que nao esta.
export function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  if (king === null) {
    return false;
  }
  return isSquareAttacked(board, king, color === 'w' ? 'b' : 'w');
}
