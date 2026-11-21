import { expect, test } from 'vitest';
import type { Color, GameState, Square } from '../../engine';
import { getLegalMoves } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { isInCheck } from '../../engine/status/attack';

const position = (fen: string, turn: Color = 'w'): GameState => ({
  board: boardFromFen(fen), turn, pendingPromotion: null,
  internal: {
    castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
    enPassant: null, halfmoveClock: 0, fullmoveNumber: 1,
  },
});
const move = (from: Square, to: Square) => ({ from, to });

test('captura disponivel com rei realmente em xeque', () => {
  const state = position('k7/8/8/8/8/8/4r2R/4K3');
  expect(isInCheck(state.board, 'w')).toBe(true);
  expect(getLegalMoves(state)).toContainEqual(move([6, 7], [6, 4]));
});

test('xeque duplo tem fugas nao vazias exclusivamente do rei', () => {
  const state = position('k3r3/8/8/8/1b6/8/2N5/4K3');
  expect(isInCheck(state.board, 'w')).toBe(true);
  // Torre e8 e bispo b4: e3 so interrompe a torre; b4 so captura o bispo.
  const moves = getLegalMoves(state);
  expect(moves).toEqual(expect.arrayContaining([
    move([7, 4], [7, 3]), move([7, 4], [7, 5]), move([7, 4], [6, 5]),
  ]));
  expect(moves).toHaveLength(3);
});

test('reis nao podem se aproximar ate casas adjacentes', () => {
  const state = position('8/8/8/8/8/4k3/8/4K3');
  const moves = getLegalMoves(state);
  expect(moves).toHaveLength(2);
  expect(moves).toEqual(expect.arrayContaining([
    move([7, 4], [7, 3]), move([7, 4], [7, 5]),
  ]));
});

test('rei adversario nao e alvo de captura mesmo em tabuleiro de analise', () => {
  // Posicao de analise deliberada: a torre ja ataca o rei fora da vez.
  // O contrato do gerador ainda deve excluir a captura do rei, preservando outro destino.
  const state = position('4k3/8/8/8/8/8/4R3/K7');
  const legal = getLegalMoves(state);
  expect(legal).not.toContainEqual(move([6, 4], [0, 4]));
  expect(legal).toContainEqual(move([6, 4], [1, 4]));
});
