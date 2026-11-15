import { afterEach, describe, expect, test, vi } from 'vitest';
import type { GameState } from '../../engine';
import { applyMove, createGame, getLegalMoves } from '../../engine';
import { chooseMove } from '../../ai';
import { generateMoves } from '../../ai/moveGeneration';
import { alphaBeta, findBestMove } from '../../ai/search';
import { MIDDLEGAME, PROMOTION, stateFromFen } from './aiHelpers';

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}

// Posicoes que exercitam os campos do estado: roque, en passant, promocao e historico
function buildPositions(): { name: string; state: GameState }[] {
  const castlingBase = stateFromFen('r3k2r/8/8/8/8/8/8/R3K2R', 'w');
  const castling: GameState = {
    ...castlingBase,
    internal: {
      ...castlingBase.internal,
      castling: { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true },
    },
  };

  const enPassant = applyMove(stateFromFen('k7/3p4/8/4P3/8/8/8/K7', 'b'), { from: [1, 3], to: [3, 3] });

  // Cavalos saem e voltam: a posicao inicial aparece duas vezes no historico
  let withHistory = createGame();
  for (const move of [
    { from: [7, 6], to: [5, 5] },
    { from: [0, 6], to: [2, 5] },
    { from: [5, 5], to: [7, 6] },
    { from: [2, 5], to: [0, 6] },
  ] as const) {
    withHistory = applyMove(withHistory, move);
  }

  return [
    { name: 'posicao inicial', state: createGame() },
    { name: 'meio-jogo', state: stateFromFen(MIDDLEGAME, 'w') },
    { name: 'roque disponivel', state: castling },
    { name: 'en passant disponivel', state: enPassant },
    { name: 'peao prestes a promover', state: stateFromFen(PROMOTION, 'w') },
    { name: 'com historico de posicoes', state: withHistory },
  ];
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('A IA nao altera o estado recebido', () => {
  for (const { name, state } of buildPositions()) {
    const before = structuredClone(state);
    deepFreeze(state);

    for (const level of ['easy', 'medium', 'hard'] as const) {
      test(`chooseMove, nivel ${level}: ${name}`, () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99); // sempre usa a busca
        const move = chooseMove(state, level); // lanca TypeError se algo tentar escrever
        expect(getLegalMoves(state)).toContainEqual(move);
        expect(state).toEqual(before);
      }, 120_000);
    }

    test(`findBestMove, alphaBeta e generateMoves: ${name}`, () => {
      expect(() => generateMoves(state)).not.toThrow();
      expect(() => findBestMove(state, 2)).not.toThrow();
      expect(() => alphaBeta(state, 2, -Infinity, Infinity)).not.toThrow();
      expect(state).toEqual(before);
    }, 120_000);
  }
});

describe('A IA e deterministica para o mesmo estado e o mesmo sorteio', () => {
  test('duas chamadas seguidas devolvem o mesmo lance', () => {
    const state = deepFreeze(stateFromFen(MIDDLEGAME, 'w'));
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(chooseMove(state, 'medium')).toEqual(chooseMove(state, 'medium'));
  }, 60_000);
});

describe('Promocao pendente', () => {
  test('sem lances possiveis a IA devolve null e o estado fica intacto', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const pending = applyMove(stateFromFen(PROMOTION, 'w'), { from: [1, 0], to: [0, 0] });
    expect(pending.pendingPromotion).not.toBeNull();
    const before = structuredClone(pending);
    deepFreeze(pending);

    expect(chooseMove(pending, 'hard')).toBeNull();
    expect(pending).toEqual(before);
  });
});
