import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Color, GameState, Move, Square } from '../../engine';
import { applyMove, getLegalMoves, getPiece } from '../../engine';
import { chooseMove } from '../../ai';
import { generateMoves } from '../../ai/moveGeneration';
import { stateFromFen } from './aiHelpers';

// Linha 0 = fileira 8, rei branco em a1 ([7,0])
const WHITE_EP = 'k7/3p4/8/4P3/8/8/8/K7'; // pretas jogam d7-d5, brancas capturam e5xd6
const BLACK_EP = '7k/8/8/8/3p4/8/4P3/K7'; // brancas jogam e2-e4, pretas capturam d4xe3

const PIN_EP = '7k/8/8/K2pP2r/8/8/8/8'; // torre h5 prende a fileira: e5xd6 deixaria o rei em xeque
const PIN_FREE = '7k/8/8/K2pP3/7r/8/8/8'; // mesma posicao com a torre fora da fileira 5

const key = (m: Move) => `${m.from[0]}${m.from[1]}-${m.to[0]}${m.to[1]}`;
const keys = (moves: Move[]) => moves.map(key).sort();

// Estado montado direto, com o alvo de en passant (o aiHelpers deixa em null)
function withEnPassant(fen: string, turn: Color, enPassant: Square): GameState {
  const base = stateFromFen(fen, turn);
  return { ...base, internal: { ...base.internal, enPassant } };
}

// Joga o avanco duplo pela engine, como acontece numa partida de verdade
const WHITE_CASE = {
  name: 'brancas capturam',
  start: () => stateFromFen(WHITE_EP, 'b', 7),
  push: { from: [1, 3], to: [3, 3] } as Move,
  target: [2, 3] as Square,
  capture: { from: [3, 4], to: [2, 3] } as Move,
  captured: [3, 3] as Square, // casa do peao capturado (nao e o alvo)
  color: 'w' as Color,
};
const BLACK_CASE = {
  name: 'pretas capturam',
  start: () => stateFromFen(BLACK_EP, 'w', 7),
  push: { from: [6, 4], to: [4, 4] } as Move,
  target: [5, 4] as Square,
  capture: { from: [4, 3], to: [5, 4] } as Move,
  captured: [4, 4] as Square,
  color: 'b' as Color,
};

afterEach(() => {
  vi.restoreAllMocks();
});

for (const c of [WHITE_CASE, BLACK_CASE]) {
  describe(`En passant (${c.name})`, () => {
    test('o avanco duplo abre o direito e o gerador da IA oferece a captura', () => {
      const afterPush = applyMove(c.start(), c.push);
      expect(afterPush.internal.enPassant).toEqual(c.target);

      expect(getLegalMoves(afterPush)).toContainEqual(c.capture);
      expect(generateMoves(afterPush)).toContainEqual(c.capture);
      expect(keys(generateMoves(afterPush))).toEqual(keys(getLegalMoves(afterPush)));
    });

    test('depois da captura, o peao capturado sai do tabuleiro', () => {
      const afterPush = applyMove(c.start(), c.push);
      const next = applyMove(afterPush, c.capture);

      expect(getPiece(next.board, c.target)).toEqual({ type: 'p', color: c.color }); // capturador no alvo
      expect(getPiece(next.board, c.capture.from)).toBeNull(); // origem vazia
      expect(getPiece(next.board, c.captured)).toBeNull(); // peao capturado removido
      expect(next.turn).toBe(c.color === 'w' ? 'b' : 'w');
      expect(next.pendingPromotion).toBeNull();
      expect(next.internal.enPassant).toBeNull();
      expect(next.internal.halfmoveClock).toBe(0); // lance de peao zera o contador dos 50 lances

      // O estado de antes nao foi alterado
      expect(getPiece(afterPush.board, c.captured)).not.toBeNull();
      expect(afterPush.internal.enPassant).toEqual(c.target);
    });

    for (const level of ['easy', 'medium', 'hard'] as const) {
      test(`nivel ${level}: a IA escolhe o en passant, que ganha um peao`, () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99); // nunca joga aleatorio
        const afterPush = applyMove(c.start(), c.push);

        expect(chooseMove(afterPush, level)).toEqual(c.capture);
      }, 60_000);
    }
  });
}

describe('En passant: o direito dura so um lance', () => {
  test('depois de dois lances quaisquer, a captura some da IA e da engine', () => {
    let state = applyMove(WHITE_CASE.start(), WHITE_CASE.push);
    expect(generateMoves(state)).toContainEqual(WHITE_CASE.capture);

    state = applyMove(state, { from: [7, 0], to: [6, 0] }); // brancas: Ka1-a2 (recusam a captura)
    state = applyMove(state, { from: [0, 0], to: [0, 1] }); // pretas: Ka8-b8

    expect(state.internal.enPassant).toBeNull();
    expect(getLegalMoves(state)).not.toContainEqual(WHITE_CASE.capture);
    expect(generateMoves(state)).not.toContainEqual(WHITE_CASE.capture);
  });

  test('avanco de uma casa nao abre o direito', () => {
    const state = applyMove(WHITE_CASE.start(), { from: [1, 3], to: [2, 3] }); // d7-d6
    expect(state.internal.enPassant).toBeNull();
  });
});

describe('En passant que deixaria o rei em xeque', () => {
  const target: Square = [2, 3];
  const capture: Move = { from: [3, 4], to: [2, 3] };

  test('com a torre prendendo a fileira, nem a engine nem a IA oferecem a captura', () => {
    const state = withEnPassant(PIN_EP, 'w', target);
    expect(getLegalMoves(state)).not.toContainEqual(capture);
    expect(generateMoves(state)).not.toContainEqual(capture);
    expect(keys(generateMoves(state))).toEqual(keys(getLegalMoves(state)));
  });

  test('controle: com a torre fora da fileira, a captura e legal', () => {
    const state = withEnPassant(PIN_FREE, 'w', target);
    expect(getLegalMoves(state)).toContainEqual(capture);
    expect(generateMoves(state)).toContainEqual(capture);
  });

  for (const level of ['easy', 'medium', 'hard'] as const) {
    test(`nivel ${level}: a IA nunca joga a captura ilegal`, () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const state = withEnPassant(PIN_EP, 'w', target);

      const move = chooseMove(state, level);
      expect(move).not.toBeNull();
      expect(getLegalMoves(state)).toContainEqual(move);
      expect(move).not.toEqual(capture);
    }, 60_000);
  }
});
