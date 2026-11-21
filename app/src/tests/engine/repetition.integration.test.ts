import { describe, expect, test } from 'vitest';
import type { GameState, Move } from '../../engine';
import { createGame, getGameStatus } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen, playLegalMove } from './engineTestHelpers';

const noRights = { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false };
function position(fen: string): GameState {
  return { board: boardFromFen(fen), turn: 'w', pendingPromotion: null,
    internal: { castling: noRights, enPassant: null, halfmoveClock: 0, fullmoveNumber: 1 } };
}

describe('repetição pela API real', () => {
  test('dois ciclos dos cavalos produzem ocorrências 1, 2 e 3 sem alterar estados anteriores', () => {
    const cycle: readonly Move[] = [
      { from: [7, 6], to: [5, 5] }, { from: [0, 6], to: [2, 5] },
      { from: [5, 5], to: [7, 6] }, { from: [2, 5], to: [0, 6] },
    ];
    const boards = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
      'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R',
      'rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R',
      'rnbqkb1r/pppppppp/5n2/8/8/8/PPPPPPPP/RNBQKBNR',
    ];
    let state = createGame();
    const states = [state];
    const snapshots = [structuredClone(state)];
    const initialKey = state.internal.positionHistory![0];
    expect(getGameStatus(state)).toBe('playing');
    expect(state.internal.positionHistory).toHaveLength(1);
    for (let ply = 1; ply <= 8; ply++) {
      const previous = state;
      state = playLegalMove(state, cycle[(ply - 1) % 4]);
      expect(boardToFen(state.board)).toBe(boards[ply % 4]);
      expect(state.internal.positionHistory).toHaveLength(ply + 1);
      expect(state.internal.positionHistory!.slice(0, -1)).toEqual(previous.internal.positionHistory);
      expect(state.internal.positionHistory!.filter(key => key === initialKey)).toHaveLength(1 + Math.floor(ply / 4));
      expect(getGameStatus(state)).toBe(ply === 8 ? 'threefold-repetition' : 'playing');
      states.push(state);
      snapshots.push(structuredClone(state));
    }
    const history = state.internal.positionHistory!;
    expect(new Set(history).size).toBe(4);
    expect(history.slice(4, 8)).toEqual(history.slice(0, 4));
    expect(history[8]).toBe(history[0]);
    states.forEach((saved, index) => expect(saved).toEqual(snapshots[index]));
  });

  test('retorno das peças após perda de roque inicia outra contagem', () => {
    let state = position('7k/8/8/8/8/8/8/R3K3');
    state = { ...state, internal: { ...state.internal, castling: { ...noRights, whiteQueenSide: true } } };
    const initialState = state;
    const initial = structuredClone(state);
    const cycle: readonly Move[] = [
      { from: [7, 0], to: [6, 0] }, { from: [0, 7], to: [1, 7] },
      { from: [6, 0], to: [7, 0] }, { from: [1, 7], to: [0, 7] },
    ];
    for (let ply = 1; ply <= 8; ply++) {
      state = playLegalMove(state, cycle[(ply - 1) % 4]);
      expect(state.internal.positionHistory).toHaveLength(ply + 1);
      expect(getGameStatus(state)).toBe('playing');
      if (ply % 4 === 0) {
        expect(boardToFen(state.board)).toBe('7k/8/8/8/8/8/8/R3K3');
        expect(state.turn).toBe('w');
        expect(state.internal.castling.whiteQueenSide).toBe(false);
        const history = state.internal.positionHistory!;
        expect(history[ply]).not.toBe(history[0]);
        expect(history.filter(key => key === history[ply])).toHaveLength(ply / 4);
      }
    }
    expect(initialState).toEqual(initial);
    expect(initialState.internal.castling.whiteQueenSide).toBe(true);
    expect(initial.internal.positionHistory).toBeUndefined();
  });
});
