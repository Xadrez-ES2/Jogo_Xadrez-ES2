// Script para conferir a engine pelo terminal.
// Rodar dentro de app/:  npx tsx scripts/check-engine.ts

import type { Board, Square } from '../src/engine/types';
import type { PieceStrategy } from '../src/engine/pieces/pieces';
import { createInitialBoard } from '../src/engine/board/board';
import { boardFromFen } from '../src/engine/board/notation_for_test';
import { PawnStrategy } from '../src/engine/pieces/pawn';
import { KnightStrategy } from '../src/engine/pieces/knight';
import { BishopStrategy } from '../src/engine/pieces/bishop';
import { RookStrategy } from '../src/engine/pieces/rook';
import { QueenStrategy } from '../src/engine/pieces/queen';
import { KingStrategy } from '../src/engine/pieces/king';

const FILES = 'abcdefgh';

// [6, 4] -> 'e2'
function toName(square: Square): string {
  return FILES[square[1]] + (8 - square[0]);
}

// 'e2' -> [6, 4]
function toSquare(name: string): Square {
  return [8 - Number(name[1]), FILES.indexOf(name[0])];
}

// Maiuscula = branca, minuscula = preta, ponto = casa vazia
function printBoard(board: Board): void {
  for (let row = 0; row < 8; row++) {
    let line = 8 - row + ' ';
    for (const piece of board[row]) {
      if (piece === null) {
        line += '. ';
      } else {
        line += (piece.color === 'w' ? piece.type.toUpperCase() : piece.type) + ' ';
      }
    }
    console.log(line);
  }
  console.log('  a b c d e f g h\n');
}

// Compara os destinos calculados com os esperados (a ordem nao importa)
function check(title: string, board: Board, piece: PieceStrategy, from: string, expected: string): void {
  const got = piece.moves(board, toSquare(from)).map(toName).sort().join(' ');
  const want = expected.split(' ').filter((s) => s !== '').sort().join(' ');
  const status = got === want ? 'OK  ' : 'ERRO';
  console.log(`${status} ${title}: ${got || '(nenhum)'}`);
  if (got !== want) {
    console.log(`     esperado: ${want || '(nenhum)'}`);
  }
}

const initial = createInitialBoard();
printBoard(initial);
check('Peao e2', initial, new PawnStrategy(), 'e2', 'e3 e4');
check('Cavalo b1', initial, new KnightStrategy(), 'b1', 'a3 c3');
check('Bispo c1', initial, new BishopStrategy(), 'c1', '');
check('Torre a1', initial, new RookStrategy(), 'a1', '');
check('Dama d1', initial, new QueenStrategy(), 'd1', '');
check('Rei e1', initial, new KingStrategy(), 'e1', '');

const middle = boardFromFen('8/8/3P1p2/8/3Q1p2/8/8/8');
printBoard(middle);
check('Dama d4', middle, new QueenStrategy(), 'd4',
  'd5 d3 d2 d1 c4 b4 a4 e4 f4 c5 b6 a7 e5 f6 c3 b2 a1 e3 f2 g1');
