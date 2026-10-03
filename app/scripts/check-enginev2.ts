// Script para conferir a engine pelo terminal.
// Rodar dentro de app/:  npx tsx scripts/check-engine.ts

import type { Board, Color, GameState, Square } from '../src/engine/types';
import type { PieceStrategy } from '../src/engine/pieces/pieces';
import { createInitialBoard } from '../src/engine/board/board';
import { boardFromFen } from '../src/engine/board/notation_for_test';
import { PawnStrategy } from '../src/engine/pieces/pawn';
import { KnightStrategy } from '../src/engine/pieces/knight';
import { BishopStrategy } from '../src/engine/pieces/bishop';
import { RookStrategy } from '../src/engine/pieces/rook';
import { QueenStrategy } from '../src/engine/pieces/queen';
import { KingStrategy } from '../src/engine/pieces/king';
import { movePiece } from '../src/engine/board/movePiece';
import { createGame } from '../src/engine/game/createGame';
import { getLegalMoves } from '../src/engine/moves/legalMoves';
import { applyMove } from '../src/engine/game/applyMove';

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

// Compara um tabuleiro com o tabuleiro esperado, escrito como FEN
function checkBoard(title: string, board: Board, expectedFen: string): void {
  const ok = JSON.stringify(board) === JSON.stringify(boardFromFen(expectedFen));
  console.log(`${ok ? 'OK  ' : 'ERRO'} ${title}`);
  if (!ok) {
    printBoard(board);
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

// #19 Captura
const moved = movePiece(initial, { from: toSquare('e2'), to: toSquare('e4') });
checkBoard('Peao e2 para e4', moved, 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
checkBoard('Tabuleiro original nao mudou', initial, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
const capture = boardFromFen('8/8/8/3p4/4P3/8/8/8');
checkBoard('Peao e4 captura em d5', movePiece(capture, { from: toSquare('e4'), to: toSquare('d5') }), '8/8/8/3P4/8/8/8/8');

// #21 Calculo de jogadas permitidas
// Monta um estado a partir de uma FEN e de quem tem a vez
function stateFromFen(fen: string, turn: Color): GameState {
  return { ...createGame(), board: boardFromFen(fen), turn };
}

// Compara as jogadas legais com as esperadas, escritas como 'e2e4' (ordem nao importa)
function checkMoves(title: string, state: GameState, expected: string): void {
  const got = getLegalMoves(state).map((m) => toName(m.from) + toName(m.to)).sort().join(' ');
  const want = expected.split(' ').filter((s) => s !== '').sort().join(' ');
  const count = got === '' ? 0 : got.split(' ').length;
  console.log(`${got === want ? 'OK  ' : 'ERRO'} ${title} (${count} lances)`);
  if (got !== want) {
    console.log(`     obtido:   ${got || '(nenhum)'}`);
    console.log(`     esperado: ${want || '(nenhum)'}`);
  }
}

const opening = 'a2a3 a2a4 b2b3 b2b4 c2c3 c2c4 d2d3 d2d4 e2e3 e2e4 f2f3 f2f4 g2g3 g2g4 h2h3 h2h4 b1a3 b1c3 g1f3 g1h3';
checkMoves('Posicao inicial, brancas', createGame(), opening);
const opening2 = 'a7a6 a7a5 b7b6 b7b5 c7c6 c7c5 d7d6 d7d5 e7e6 e7e5 f7f6 f7f5 g7g6 g7g5 h7h6 h7h5 b8a6 b8c6 g8f6 g8h6';
checkMoves('Posicao inicial, pretas', stateFromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 'b'), opening2);
// Os casos de cravada, xeque, mate e afogamento voltam na issue #27,
// quando o filtro de xeque for adicionado.

// #15 Controle do turno
// Confere uma condicao e mostra OK ou ERRO
function checkTrue(title: string, condition: boolean): void {
  console.log(`${condition ? 'OK  ' : 'ERRO'} ${title}`);
}

const start = createGame();
const afterE4 = applyMove(start, { from: toSquare('e2'), to: toSquare('e4') });
checkBoard('Depois de e2-e4', afterE4.board, 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
checkTrue('Turno passou para as pretas', afterE4.turn === 'b');
checkTrue('Numero do lance continua 1', afterE4.internal.fullmoveNumber === 1);
checkTrue('Estado original nao mudou', start.turn === 'w' && start.board[6][4] !== null);
checkMoves('Pretas depois de e2-e4', afterE4, opening2);

const afterE5 = applyMove(afterE4, { from: toSquare('e7'), to: toSquare('e5') });
checkTrue('Turno voltou para as brancas', afterE5.turn === 'w');
checkTrue('Numero do lance passou para 2', afterE5.internal.fullmoveNumber === 2);
