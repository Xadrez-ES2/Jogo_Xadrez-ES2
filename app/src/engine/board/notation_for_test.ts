// Essa função serve apenas para teste do engine;

import type { Board, Color, PieceType } from '../types';
import { createEmptyBoard } from './board';

// Monta o tabuleiro a partir da parte de posicao de uma FEN.
// Exemplo (posicao inicial): 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
// Cada parte separada por / e uma fileira, comecando pela 8 (linha 0).
// Letra maiuscula = peca branca, minuscula = preta, numero = casas vazias.
// A FEN nao e validada: serve para a engine montar posicoes conhecidas.
export function boardFromFen(fen: string): Board {
  const board = createEmptyBoard();
  const position = fen.split(' ')[0];
  const rows = position.split('/');

  for (let row = 0; row < 8; row++) {
    let col = 0;
    for (const char of rows[row]) {
      if (char >= '1' && char <= '8') {
        col += Number(char);
      } else {
        const color: Color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as PieceType;
        board[row][col] = { type, color };
        col++;
      }
    }
  }
  return board;
}
