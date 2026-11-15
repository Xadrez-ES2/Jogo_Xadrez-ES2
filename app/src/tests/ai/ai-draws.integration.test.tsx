import { afterEach, describe, expect, test, vi } from 'vitest';
import type { GameState } from '../../engine';
import { applyMove, getGameStatus, getLegalMoves, promotePawn } from '../../engine';
import { chooseMove } from '../../ai';
import type { Difficulty } from '../../ai';
import { stateFromFen } from './aiHelpers';

const END_STATUS = ['checkmate', 'stalemate', 'fifty-moves', 'threefold-repetition', 'insufficient-material'];

// Linha 0 = fileira 8. Posicoes simples, sem como dar mate ou afogar em poucos lances.
const ROOK_ENDING = '8/8/8/3k4/8/8/8/K6R'; // rei+torre contra rei no centro
const SAVE_BY_PAWN = '7k/8/8/8/8/8/P7/K1Q5'; // com o contador em 99, so lance de peao evita o empate
const KNIGHT_TRADE = '7k/8/8/8/4n3/2N5/8/K7'; // Cxe4 deixa rei+cavalo contra rei

const LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];

// Sorteio com semente fixa: a partida e sempre a mesma
function seedRandom(seed: number) {
  vi.spyOn(Math, 'random').mockImplementation(() => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  });
}

// Joga como a interface: so para quando a engine informa o fim da partida
function playUntilEnd(initial: GameState, level: Difficulty, maxPlies: number) {
  let state = initial;
  let plies = 0;
  while (!END_STATUS.includes(getGameStatus(state)) && plies < maxPlies) {
    const move = chooseMove(state, level);
    expect(move).not.toBeNull();
    expect(getLegalMoves(state)).toContainEqual(move);
    state = applyMove(state, move!);
    if (state.pendingPromotion) state = promotePawn(state, 'q');
    plies++;
  }
  return { state, plies, status: getGameStatus(state) };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Regra dos 50 lances numa partida IA x IA', () => {
  // Nessas posicoes nao ha peao nem captura possivel: todo lance soma 1 ao contador
  const CASES = [
    { clock: 99, plies: 1 },
    { clock: 98, plies: 2 },
  ];

  for (const level of LEVELS) {
    for (const { clock, plies } of CASES) {
      test(`nivel ${level}: contador em ${clock} termina em ${plies} meio-lance(s)`, () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const result = playUntilEnd(stateFromFen(ROOK_ENDING, 'w', clock), level, 10);

        expect(result.status).toBe('fifty-moves');
        expect(result.plies).toBe(plies);
        expect(result.state.internal.halfmoveClock).toBe(100);
      }, 60_000);
    }
  }
});

describe('A busca da IA conhece a regra dos 50 lances', () => {
  for (const level of LEVELS) {
    test(`nivel ${level}: com o contador em 99, a IA ganhando joga lance de peao e evita o empate`, () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const state = stateFromFen(SAVE_BY_PAWN, 'w', 99);
      expect(getGameStatus(state)).toBe('playing');

      const move = chooseMove(state, level);
      expect(move!.from).toEqual([6, 0]); // o peao de a2

      const next = applyMove(state, move!);
      expect(next.internal.halfmoveClock).toBe(0);
      expect(getGameStatus(next)).not.toBe('fifty-moves');
    }, 60_000);
  }
});

describe('Material insuficiente numa partida IA x IA', () => {
  for (const level of LEVELS) {
    test(`nivel ${level}: a captura que deixa rei+cavalo contra rei encerra a partida`, () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const start = stateFromFen(KNIGHT_TRADE, 'w');
      expect(getGameStatus(start)).toBe('playing');

      const result = playUntilEnd(start, level, 10);
      expect(result.status).toBe('insufficient-material');
      expect(result.plies).toBe(1);
    }, 60_000);
  }
});

describe('Finais completos IA x IA sempre terminam', () => {
  for (const level of LEVELS) {
    test(`nivel ${level}: rei+torre contra rei termina em ate 100 meio-lances`, () => {
      seedRandom(11);
      const result = playUntilEnd(stateFromFen(ROOK_ENDING, 'w'), level, 200);
      console.log(`${level}: ${result.status} em ${result.plies} meio-lances`);

      // Sem peao nem captura, o contador chega a 100 se nada acontecer antes
      expect(END_STATUS).toContain(result.status);
      expect(result.plies).toBeLessThanOrEqual(100);
    }, 120_000);
  }
});