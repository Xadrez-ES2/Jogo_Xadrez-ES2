import { describe, expect, test } from 'vitest';
import type { GameState } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { isFiftyMoveDraw, isInsufficientMaterial } from '../../engine/status/draw';

function position(halfmoveClock: number): GameState {
  return { board: boardFromFen('7k/8/8/8/8/8/8/R3K3'), turn: 'w', pendingPromotion: null,
    internal: { castling: { whiteKingSide: false, whiteQueenSide: false,
      blackKingSide: false, blackQueenSide: false }, enPassant: null, halfmoveClock, fullmoveNumber: 50 } };
}

describe('empate automático por contagem', () => {
  test.each([
    [99, false], [100, true], [101, true],
  ] as const)('contador de %i meio-lances reconhece empate = %s', (clock, expected) => {
    const state = position(clock);
    const before = structuredClone(state);
    expect(isFiftyMoveDraw(state)).toBe(expected);
    expect(state).toEqual(before);
  });
});

describe('material insuficiente', () => {
  test.each([
    ['bispos adversários em casas claras', '2b1k3/8/8/8/8/8/8/4KB2', true],
    ['bispos adversários em cores de casas diferentes', '2b1k3/8/8/8/8/8/8/2B1K3', false],
    // Dois cavalos não forçam mate contra rei, mas o mate é possível.
    ['dois cavalos contra rei', '4k3/8/8/8/8/8/8/1N2K1N1', false],
  ] as const)('%s', (_description, fen, expected) => {
    const board = boardFromFen(fen);
    const before = structuredClone(board);
    expect(isInsufficientMaterial(board)).toBe(expected);
    expect(board).toEqual(before);
  });
});
