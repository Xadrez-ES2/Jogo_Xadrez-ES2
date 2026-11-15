import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Color, GameState, Move } from '../../engine';
import { applyMove, createGame, getGameStatus, getLegalMoves, promotePawn } from '../../engine';
import { isInCheck } from '../../engine/status/attack';
import { chooseMove } from '../../ai';
import type { Difficulty } from '../../ai';
import { MATED, stateFromFen } from './aiHelpers';

const LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];

// Linha 0 = fileira 8. Em todas as posicoes o jogador da vez esta em xeque.
const CASES: { name: string; fen: string; turn: Color; expected?: Move }[] = [
  { name: 'brancas: rei precisa fugir da torre', fen: '3kr3/8/8/8/8/8/8/4K3', turn: 'w' },
  { name: 'pretas: rei precisa fugir da torre', fen: '4k3/8/8/8/8/8/8/3KR3', turn: 'b' },
  // Rei encurralado pelos proprios peoes: o unico lance legal e bloquear com a torre em d1
  { name: 'brancas: unico lance e bloquear', fen: '7k/8/8/3R4/8/8/PP6/K6r', turn: 'w', expected: { from: [3, 3], to: [7, 3] } },
  // O cavalo em c2 da xeque e esta desprotegido: a melhor resposta e capturar com a torre
  { name: 'brancas: capturar o cavalo que da xeque', fen: '7k/8/8/8/2R5/8/2n5/K7', turn: 'w', expected: { from: [4, 2], to: [6, 2] } },
];

const END_STATUS = ['checkmate', 'stalemate', 'fifty-moves', 'threefold-repetition', 'insufficient-material'];

// Sorteio com semente fixa: a partida e sempre a mesma
function seedRandom(seed: number) {
  vi.spyOn(Math, 'random').mockImplementation(() => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Em xeque, a IA sai do xeque', () => {
  for (const level of LEVELS) {
    for (const { name, fen, turn, expected } of CASES) {
      test(`nivel ${level}: ${name}`, () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99); // nunca joga aleatorio
        const state = stateFromFen(fen, turn);
        expect(getGameStatus(state)).toBe('check'); // a posicao do teste esta mesmo em xeque

        const move = chooseMove(state, level);
        expect(move).not.toBeNull();
        expect(getLegalMoves(state)).toContainEqual(move);
        if (expected) expect(move).toEqual(expected);

        // Depois do lance, o rei de quem jogou nao esta mais atacado
        const next = applyMove(state, move!);
        expect(isInCheck(next.board, turn)).toBe(false);
      });
    }
  }
});

describe('Em xeque-mate, a IA nao tem lance', () => {
  for (const level of LEVELS) {
    test(`nivel ${level}: devolve null`, () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const mated = stateFromFen(MATED, 'w');
      expect(getGameStatus(mated)).toBe('checkmate');
      expect(chooseMove(mated, level)).toBeNull();
    });
  }
});

describe('Durante partidas IA x IA, toda vez que ha xeque a IA sai dele', () => {
  const GAMES: { level: Difficulty; maxPlies: number }[] = [
    { level: 'easy', maxPlies: 300 },
    { level: 'medium', maxPlies: 200 },
    { level: 'hard', maxPlies: 100 }, // o nivel dificil e o mais lento
  ];

  for (const { level, maxPlies } of GAMES) {
    test(`nivel ${level}`, () => {
      seedRandom(7);
      let state: GameState = createGame();
      let plies = 0;
      let checks = 0;

      while (!END_STATUS.includes(getGameStatus(state)) && plies < maxPlies) {
        const inCheck = getGameStatus(state) === 'check';
        const mover = state.turn;
        const move = chooseMove(state, level);
        expect(move).not.toBeNull();

        state = applyMove(state, move!);
        if (state.pendingPromotion) state = promotePawn(state, 'q');

        if (inCheck) {
          checks++;
          expect(isInCheck(state.board, mover), `xeque nao resolvido no meio-lance ${plies}`).toBe(false);
        }
        plies++;
      }
      console.log(`${level}: ${checks} xeques resolvidos em ${plies} meio-lances`);
    }, 120_000);
  }
});
