// Issue: Teste de integracao: promocao de peao pela IA
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Color, GameState, Square } from '../../engine';
import { applyMove, getGameStatus, getLegalMoves, getPiece, promotePawn } from '../../engine';
import { chooseMove } from '../../ai';
import { PROMOTION, stateFromFen } from './aiHelpers';

const CASES: { name: string; fen: string; turn: Color; square: Square }[] = [
  { name: 'brancas promovem em a8', fen: PROMOTION, turn: 'w', square: [0, 0] },
  { name: 'pretas promovem em a1', fen: 'k7/8/8/8/8/8/p7/7K', turn: 'b', square: [7, 0] },
  { name: 'brancas promovem capturando a torre em a8', fen: 'r6k/1P6/8/8/8/8/8/K7', turn: 'w', square: [0, 0] },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Promocao de peao pela IA', () => {
  for (const level of ['easy', 'medium', 'hard'] as const) {
    for (const { name, fen, turn, square } of CASES) {
      test(`nivel ${level}: ${name}`, () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99); // nunca joga aleatorio
        const state = stateFromFen(fen, turn);

        // 1. A IA escolhe levar o peao ate a ultima fileira
        const move = chooseMove(state, level);
        expect(move).not.toBeNull();
        expect(move!.to).toEqual(square);
        expect(getLegalMoves(state)).toContainEqual(move);

        // 2. A engine deixa a promocao pendente e a vez continua com quem promove
        const pending: GameState = applyMove(state, move!);
        expect(pending.pendingPromotion).toEqual(square);
        expect(pending.turn).toBe(turn);
        expect(getPiece(pending.board, square)).toEqual({ type: 'p', color: turn });
        expect(getGameStatus(pending)).toBe('playing');

        // 3. A promocao e completada com dama, como faz a interface
        const promoted = promotePawn(pending, 'q');
        expect(promoted.pendingPromotion).toBeNull();
        expect(getPiece(promoted.board, square)).toEqual({ type: 'q', color: turn });
        expect(promoted.turn).not.toBe(turn);

        // 4. A partida continua: o adversario tem lance e a IA consegue responder
        expect(['playing', 'check']).toContain(getGameStatus(promoted));
        const reply = chooseMove(promoted, level);
        expect(getLegalMoves(promoted)).toContainEqual(reply);
      });
    }
  }
});
