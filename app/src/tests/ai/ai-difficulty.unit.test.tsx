// Issue: Testes dos niveis de dificuldade
import { afterEach, describe, expect, test, vi } from 'vitest';
import { chooseMove } from '../../ai';
import { DIFFICULTY_PARAMS } from '../../ai/difficulty';
import { generateMoves } from '../../ai/moveGeneration';
import { HANGING_QUEEN, MATED, TRAP, WHITE_MATE_IN_1, stateFromFen } from './aiHelpers';

const MATE = { from: [7, 0], to: [0, 0] }; // Ta8#
const GRAB_PAWN = { from: [7, 3], to: [3, 3] }; // Txd5, perde a torre

// Math.random e substituido (stub) para o teste nao depender da sorte
function stubRandom(value: number) {
  vi.spyOn(Math, 'random').mockReturnValue(value);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Parametros dos niveis', () => {
  test('profundidade sobe e aleatoriedade desce com o nivel', () => {
    const { easy, medium, hard } = DIFFICULTY_PARAMS;
    expect(easy.depth < medium.depth && medium.depth < hard.depth).toBe(true);
    expect(easy.randomChance > medium.randomChance && medium.randomChance > hard.randomChance).toBe(true);
    expect(hard.randomChance).toBe(0);
  });
});

describe('Lance aleatorio x busca', () => {
  test('sorteio abaixo da chance joga lance aleatorio', () => {
    stubRandom(0.29);
    const state = stateFromFen(HANGING_QUEEN);
    const moves = generateMoves(state);
    expect(chooseMove(state, 'easy')).toEqual(moves[Math.floor(0.29 * moves.length)]);
  });

  test('sorteio igual a chance ja usa a busca', () => {
    stubRandom(0.3);
    expect(chooseMove(stateFromFen(WHITE_MATE_IN_1), 'easy')).toEqual(MATE);
  });

  test('dificil nunca joga aleatorio', () => {
    stubRandom(0);
    expect(chooseMove(stateFromFen(WHITE_MATE_IN_1), 'hard')).toEqual(MATE);
  });

  test('sem lances devolve null em qualquer nivel', () => {
    stubRandom(0); // facil e medio tentam o lance aleatorio, mas nao ha lances
    for (const level of ['easy', 'medium', 'hard'] as const) {
      expect(chooseMove(stateFromFen(MATED), level)).toBeNull();
    }
  });
});

describe('Forca de cada nivel', () => {
  test('facil cai na armadilha, medio e dificil nao', () => {
    stubRandom(0.99); // nunca aleatorio
    const state = stateFromFen(TRAP);
    expect(chooseMove(state, 'easy')).toEqual(GRAB_PAWN);
    expect(chooseMove(state, 'medium')).not.toEqual(GRAB_PAWN);
    expect(chooseMove(state, 'hard')).not.toEqual(GRAB_PAWN);
  });
});
