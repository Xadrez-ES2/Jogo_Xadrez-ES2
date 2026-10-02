import type { Board, Piece, PieceType, Square } from '../types';

// Retorna a peca que esta na casa, ou null se a casa estiver vazia.
export function getPiece(board: Board, square: Square): Piece | null {
  return board[square[0]][square[1]];
}

// Cria um tabuleiro 8x8 sem nenhuma peca.
export function createEmptyBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = [];
  for (let row = 0; row < 8; row++) {
    board.push([null, null, null, null, null, null, null, null]);
  }
  return board;
}

// Copia o tabuleiro linha por linha.
// Copiar so a lista de fora deixaria as linhas compartilhadas com o original.
export function copyBoard(board: Board): (Piece | null)[][] {
  return board.map((row) => [...row]);
}

// Ordem das pecas na primeira e na ultima fileira, da coluna a ate a h.
const BACK_ROW: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

// Cria o tabuleiro na posicao inicial.
// Linha 0 = fileira 8 (pretas) e linha 7 = fileira 1 (brancas).
export function createInitialBoard(): Board {
  const board = createEmptyBoard();
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: BACK_ROW[col], color: 'b' };
    board[1][col] = { type: 'p', color: 'b' };
    board[6][col] = { type: 'p', color: 'w' };
    board[7][col] = { type: BACK_ROW[col], color: 'w' };
  }
  return board;
}
