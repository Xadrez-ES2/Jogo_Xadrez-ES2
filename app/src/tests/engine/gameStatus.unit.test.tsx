import { describe, expect, test } from 'vitest';
import type { Color, GameState } from '../../engine';
import { getGameStatus } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { getPositionKey } from '../../engine/status/repetition';

const noCastling = { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false };

function position(fen: string, turn: Color = 'w', halfmoveClock = 0): GameState {
  return {
    board: boardFromFen(fen),
    turn,
    pendingPromotion: null,
    internal: {
      castling: noCastling,
      enPassant: null,
      halfmoveClock,
      fullmoveNumber: 1,
    },
  };
}

describe('getGameStatus', () => {
  test('retorna playing quando ha lances e nao ha condicao de fim', () => {
    expect(getGameStatus(position('4k3/8/8/8/8/8/4P3/4K3'))).toBe('playing');
  });

  test('retorna playing enquanto a promocao esta pendente', () => {
    const state = position('7k/P7/8/8/8/8/8/K7');
    expect(getGameStatus({ ...state, pendingPromotion: [0, 0] })).toBe('playing');
  });

  test('retorna check quando o rei esta atacado e ainda pode jogar', () => {
    expect(getGameStatus(position('4k3/8/8/8/8/8/8/4R1K1', 'b'))).toBe('check');
  });

  test('retorna checkmate quando o rei esta atacado e nao ha lance legal', () => {
    expect(getGameStatus(position('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR', 'w')))
      .toBe('checkmate');
  });

  test('retorna stalemate quando nao ha lance legal e o rei nao esta em xeque', () => {
    expect(getGameStatus(position('7k/5Q2/6K1/8/8/8/8/8', 'b'))).toBe('stalemate');
  });

  test('retorna fifty-moves ao atingir 100 meio-lances', () => {
    expect(getGameStatus(position('4k3/8/8/8/8/8/8/R3K3', 'w', 100))).toBe('fifty-moves');
  });

  test('retorna insufficient-material com apenas os reis', () => {
    expect(getGameStatus(position('4k3/8/8/8/8/8/8/4K3'))).toBe('insufficient-material');
  });

  test('retorna threefold-repetition na terceira ocorrencia da posicao', () => {
    const state = position('4k3/8/8/8/8/8/4P3/4K3');
    const key = getPositionKey(state);
    const repeated: GameState = {
      ...state,
      internal: { ...state.internal, positionHistory: [key, key, key] },
    };
    expect(getGameStatus(repeated)).toBe('threefold-repetition');
  });

  test('xeque-mate tem precedencia sobre empate dos 50 lances', () => {
    expect(getGameStatus(position('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR', 'w', 100)))
      .toBe('checkmate');
  });

  test('distingue afogamento de xeque-mate', () => {
    const stalemate = position('7k/5Q2/6K1/8/8/8/8/8', 'b');
    const checkmate = position('7k/6Q1/6K1/8/8/8/8/8', 'b');
    expect(getGameStatus(stalemate)).toBe('stalemate');
    expect(getGameStatus(checkmate)).toBe('checkmate');
  });
});
