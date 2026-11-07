// Issue: Teste de integracao: partidas completas IA x IA
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { GameState } from '../../engine';
import { applyMove, createGame, getGameStatus, getLegalMoves, promotePawn } from '../../engine';
import { chooseMove } from '../../ai';
import type { Difficulty } from '../../ai';

const MAX_PLIES = 300; // 150 lances de cada lado
const END_STATUS = ['checkmate', 'stalemate', 'fifty-moves', 'threefold-repetition', 'insufficient-material'];

// Sorteio com semente fixa: a partida continua tendo lances aleatorios,
// mas e sempre a mesma, entao o teste pode ser repetido
function seedRandom(seed: number) {
  vi.spyOn(Math, 'random').mockImplementation(() => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  });
}

// Joga IA contra IA a partir da posicao inicial, do mesmo jeito que a interface faz
function playGame(level: Difficulty) {
  let state: GameState = createGame();
  let plies = 0;
  while (!END_STATUS.includes(getGameStatus(state)) && plies < MAX_PLIES) {
    const move = chooseMove(state, level);
    expect(move).not.toBeNull();
    expect(getLegalMoves(state)).toContainEqual(move); // a IA so joga lance legal
    state = applyMove(state, move!);
    if (state.pendingPromotion) state = promotePawn(state, 'q');
    plies++;
  }
  return { status: getGameStatus(state), plies };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Partidas completas IA x IA', () => {
  for (const level of ['easy', 'medium', 'hard'] as const) {
    test(`nivel ${level}: so lances legais e a partida termina`, () => {
      seedRandom(42);
      const { status, plies } = playGame(level);
      console.log(`${level}: ${status} em ${plies} meio-lances`);
      expect(END_STATUS).toContain(status);
      expect(plies).toBeLessThanOrEqual(MAX_PLIES);
    }, 120_000); // o nivel dificil leva uns 20 s por partida
  }
});
