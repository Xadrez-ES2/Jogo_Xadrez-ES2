import { describe, expect, test } from 'vitest';
import type { Color, GameState, Move } from '../../engine';
import { getGameStatus } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { playLegalMove } from './engineTestHelpers';

function position(fen: string, turn: Color = 'w'): GameState {
  return { board: boardFromFen(fen), turn, pendingPromotion: null,
    internal: { castling: { whiteKingSide: false, whiteQueenSide: false,
      blackKingSide: false, blackQueenSide: false }, enPassant: null, halfmoveClock: 99, fullmoveNumber: 75 } };
}

describe('contagem e precedência pela API real', () => {
  test.each([
    { description: 'jogada comum atinge 100 e encerra automaticamente',
      fen: '7k/8/8/8/8/8/8/R3K3', move: { from: [7, 0], to: [6, 0] }, clock: 100,
      after: '7k/8/8/8/8/8/R7/4K3', status: 'fifty-moves' },
    { description: 'avanço de peão impede empate iminente',
      fen: '4k3/8/8/8/8/8/4P3/4K3', move: { from: [6, 4], to: [5, 4] }, clock: 0,
      after: '4k3/8/8/8/8/4P3/8/4K3', status: 'playing' },
  ] satisfies { description: string; fen: string; move: Move; clock: number; after: string; status: string }[])(
    '$description', ({ fen, move, clock, after, status }) => {
      const state = position(fen);
      const snapshot = structuredClone(state);
      expect(getGameStatus(state)).toBe('playing');
      const next = playLegalMove(state, move);
      expect(next.board).toEqual(boardFromFen(after));
      expect(next.internal.halfmoveClock).toBe(clock);
      expect(next.turn).toBe('b');
      expect(getGameStatus(next)).toBe(status);
      expect(state).toEqual(snapshot);
    });

  test('Ne2xf4 captura o peão e impede empate iminente', () => {
    const state = position('4k3/8/8/8/5p2/8/4N3/R3K3');
    const snapshot = structuredClone(state);
    expect(getGameStatus(state)).toBe('playing');

    const next = playLegalMove(state, { from: [6, 4], to: [4, 5] });

    expect(next.board).toEqual(boardFromFen('4k3/8/8/8/5N2/8/8/R3K3'));
    expect(next.turn).toBe('b');
    expect(next.pendingPromotion).toBeNull();
    expect(next.internal).toMatchObject({
      castling: snapshot.internal.castling,
      enPassant: null,
      halfmoveClock: 0,
      fullmoveNumber: 75,
    });
    expect(next.internal.positionHistory).toHaveLength(2);
    expect(getGameStatus(next)).toBe('playing');
    expect(state).toEqual(snapshot);
  });

  test('Qh4# legal sem captura completa 100 e mate precede cinquenta lances', () => {
    // Disposição anterior ao Mate do Louco; contador preestabelecido em 99.
    // Não se atribui esse contador à sequência curta 1.f3 e5 2.g4.
    const state = position('rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR', 'b');
    const snapshot = structuredClone(state);
    expect(getGameStatus(state)).toBe('playing');
    expect(state.board[4][7]).toBeNull();
    const next = playLegalMove(state, { from: [0, 3], to: [4, 7] });
    expect(next.board).toEqual(boardFromFen('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR'));
    expect(next.internal.halfmoveClock).toBe(100);
    expect(next.internal.fullmoveNumber).toBe(76);
    expect(next.turn).toBe('w');
    expect(getGameStatus(next)).toBe('checkmate');
    expect(state).toEqual(snapshot);
  });
});
