import type { Board, Square } from '../types';
import type { PieceStrategy } from './pieces';
import { slide } from './slide';
import { ROOK_MOVES } from './rook';
import { BISHOP_MOVES } from './bishop';

// A dama anda nas direcoes da torre e do bispo juntas (8 direcoes).
const QUEEN_MOVES: readonly [number, number][] = [
  ...ROOK_MOVES,
  ...BISHOP_MOVES,
];

// Estrategia de movimento da dama.
export class QueenStrategy implements PieceStrategy {
  moves(board: Board, from: Square): Square[] {
    return slide(board, from, QUEEN_MOVES);
  }
}
