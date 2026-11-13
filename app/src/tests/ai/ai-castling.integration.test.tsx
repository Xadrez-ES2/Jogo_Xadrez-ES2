// Teste de integracao: roque na IA

import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Color, GameState, Move, Square } from '../../engine';
import { applyMove, getLegalMoves, getPiece } from '../../engine';
import { chooseMove } from '../../ai';
import { generateMoves } from '../../ai/moveGeneration';
import { findBestMove } from '../../ai/search';
import { stateFromFen } from './aiHelpers';

type Rights = GameState['internal']['castling'];

const ALL_RIGHTS: Rights = { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true };
const NO_RIGHTS: Rights = { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false };


function withCastling(fen: string, turn: Color, castling: Rights): GameState {
  const base = stateFromFen(fen, turn);
  return { ...base, internal: { ...base.internal, castling } };
}

// Posicoes (linha 0 = fileira 8, rei branco em [7,4], rei preto em [0,4])
const BOTH = 'r3k2r/8/8/8/8/8/8/R3K2R'; // roque livre nos dois lados
const BLOCKED = 'r3k2r/8/8/8/8/8/8/RN2K1NR'; // cavalos entre rei e torres
const IN_CHECK = '3kr3/8/8/8/8/8/8/R3K2R'; // rei branco em xeque pela torre e8
const TRANSIT_ATTACKED = '3k1r2/8/8/8/8/8/8/R3K2R'; // torre f8 ataca f1, casa de passagem

const isCastle = (state: GameState, m: Move) =>
  getPiece(state.board, m.from)?.type === 'k' && Math.abs(m.to[1] - m.from[1]) === 2;

const key = (m: Move) => `${m.from[0]}${m.from[1]}-${m.to[0]}${m.to[1]}`;
const keys = (moves: Move[]) => moves.map(key).sort();

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Roque: o gerador de lances da IA acompanha a engine', () => {
  const CASES: { name: string; turn: Color; row: number }[] = [
    { name: 'brancas', turn: 'w', row: 7 },
    { name: 'pretas', turn: 'b', row: 0 },
  ];

  for (const { name, turn, row } of CASES) {
    test(`${name} tem roque curto e roque longo disponiveis`, () => {
      const moves = generateMoves(withCastling(BOTH, turn, ALL_RIGHTS));
      expect(moves).toContainEqual({ from: [row, 4], to: [row, 6] });
      expect(moves).toContainEqual({ from: [row, 4], to: [row, 2] });
    });
  }

  const POSITIONS: { name: string; state: GameState }[] = [
    { name: 'roque livre', state: withCastling(BOTH, 'w', ALL_RIGHTS) },
    { name: 'direitos perdidos', state: withCastling(BOTH, 'w', NO_RIGHTS) },
    { name: 'caminho bloqueado', state: withCastling(BLOCKED, 'w', ALL_RIGHTS) },
    { name: 'rei em xeque', state: withCastling(IN_CHECK, 'w', ALL_RIGHTS) },
    { name: 'casa de passagem atacada', state: withCastling(TRANSIT_ATTACKED, 'w', ALL_RIGHTS) },
  ];

  for (const { name, state } of POSITIONS) {
    test(`mesmos lances da engine: ${name}`, () => {
      expect(keys(generateMoves(state))).toEqual(keys(getLegalMoves(state)));
    });
  }

  test('sem direitos, caminho bloqueado ou em xeque: nao ha roque', () => {
    for (const state of [
      withCastling(BOTH, 'w', NO_RIGHTS),
      withCastling(BLOCKED, 'w', ALL_RIGHTS),
      withCastling(IN_CHECK, 'w', ALL_RIGHTS),
    ]) {
      expect(generateMoves(state).filter((m) => isCastle(state, m))).toEqual([]);
    }
  });

  test('casa de passagem atacada impede so o roque curto', () => {
    const state = withCastling(TRANSIT_ATTACKED, 'w', ALL_RIGHTS);
    const moves = generateMoves(state);
    expect(moves).not.toContainEqual({ from: [7, 4], to: [7, 6] });
    expect(moves).toContainEqual({ from: [7, 4], to: [7, 2] });
  });
});

describe('Roque: depois do lance, o estado fica correto', () => {
  const CASES: { name: string; turn: Color; move: Move; king: Square; rook: Square; emptied: Square[] }[] = [
    { name: 'brancas, roque curto', turn: 'w', move: { from: [7, 4], to: [7, 6] }, king: [7, 6], rook: [7, 5], emptied: [[7, 4], [7, 7]] },
    { name: 'brancas, roque longo', turn: 'w', move: { from: [7, 4], to: [7, 2] }, king: [7, 2], rook: [7, 3], emptied: [[7, 4], [7, 0]] },
    { name: 'pretas, roque curto', turn: 'b', move: { from: [0, 4], to: [0, 6] }, king: [0, 6], rook: [0, 5], emptied: [[0, 4], [0, 7]] },
    { name: 'pretas, roque longo', turn: 'b', move: { from: [0, 4], to: [0, 2] }, king: [0, 2], rook: [0, 3], emptied: [[0, 4], [0, 0]] },
  ];

  for (const { name, turn, move, king, rook, emptied } of CASES) {
    test(name, () => {
      const state = withCastling(BOTH, turn, ALL_RIGHTS);
      expect(getLegalMoves(state)).toContainEqual(move);

      const next = applyMove(state, move);
      expect(getPiece(next.board, king)).toEqual({ type: 'k', color: turn });
      expect(getPiece(next.board, rook)).toEqual({ type: 'r', color: turn });
      for (const square of emptied) expect(getPiece(next.board, square)).toBeNull();

      // A vez passa, nao ha promocao e quem castelou perde os dois direitos
      expect(next.turn).toBe(turn === 'w' ? 'b' : 'w');
      expect(next.pendingPromotion).toBeNull();
      const mine = turn === 'w'
        ? [next.internal.castling.whiteKingSide, next.internal.castling.whiteQueenSide]
        : [next.internal.castling.blackKingSide, next.internal.castling.blackQueenSide];
      const theirs = turn === 'w'
        ? [next.internal.castling.blackKingSide, next.internal.castling.blackQueenSide]
        : [next.internal.castling.whiteKingSide, next.internal.castling.whiteQueenSide];
      expect(mine).toEqual([false, false]);
      expect(theirs).toEqual([true, true]);

      // O estado de antes nao foi alterado
      expect(getPiece(state.board, move.from)).toEqual({ type: 'k', color: turn });
      expect(state.internal.castling).toEqual(ALL_RIGHTS);
    });
  }
});

describe('Roque: a busca da IA passa por posicoes com roque', () => {
  test('findBestMove devolve lance legal com roque disponivel, em qualquer profundidade', () => {
    for (const turn of ['w', 'b'] as const) {
      const state = withCastling(BOTH, turn, ALL_RIGHTS);
      for (const depth of [1, 2, 3]) {
        expect(getLegalMoves(state)).toContainEqual(findBestMove(state, depth));
      }
    }
  }, 60_000);

  for (const level of ['easy', 'medium', 'hard'] as const) {
    test(`nivel ${level}: a IA responde depois de um roque`, () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99); // nunca joga aleatorio
      const state = withCastling(BOTH, 'w', ALL_RIGHTS);
      const afterCastle = applyMove(state, { from: [7, 4], to: [7, 6] });

      const reply = chooseMove(afterCastle, level);
      expect(reply).not.toBeNull();
      expect(getLegalMoves(afterCastle)).toContainEqual(reply);
    }, 60_000);
  }
});
