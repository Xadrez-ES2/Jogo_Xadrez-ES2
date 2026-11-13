import { describe, expect, test } from 'vitest';
import type { Color, GameState, Square } from '../../engine';
import { applyMove, getLegalMoves } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { isInCheck, isSquareAttacked } from '../../engine/status/attack';

const noCastling = { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false };

function position(
  fen: string,
  turn: Color = 'w',
  options: { castling?: Partial<GameState['internal']['castling']>; enPassant?: Square | null; pendingPromotion?: Square | null } = {},
): GameState {
  return {
    board: boardFromFen(fen),
    turn,
    pendingPromotion: options.pendingPromotion ?? null,
    internal: {
      castling: { ...noCastling, ...options.castling },
      enPassant: options.enPassant ?? null,
      halfmoveClock: 0,
      fullmoveNumber: 1,
    },
  };
}

const move = (from: Square, to: Square) => ({ from, to });

describe('getLegalMoves: filtro de xeque', () => {
  test('mantem a peca cravada na linha entre a torre e o rei', () => {
    const state = position('k3r3/8/8/8/8/8/4R3/4K3');
    const moves = getLegalMoves(state);
    expect(moves).toContainEqual(move([6, 4], [5, 4]));
    expect(moves).not.toContainEqual(move([6, 4], [6, 3]));
  });

  test('nao permite que o rei caminhe para uma casa atacada', () => {
    const moves = getLegalMoves(position('k3r3/8/8/8/8/8/8/4K3'));
    expect(moves).not.toContainEqual(move([7, 4], [6, 4]));
  });

  test('em xeque permite fugir, capturar o atacante ou bloquear a linha', () => {
    const state = position('k3r3/8/8/8/8/8/2N5/4K3');
    const moves = getLegalMoves(state);
    expect(moves).toContainEqual(move([6, 2], [5, 4])); // bloqueio
    expect(moves).toContainEqual(move([7, 4], [7, 3])); // fuga do rei
    expect(moves).not.toContainEqual(move([6, 2], [6, 3]));

    const capture = getLegalMoves(position('k3r3/8/8/8/8/8/4R3/4K3'));
    expect(capture).toContainEqual(move([6, 4], [0, 4])); // captura da torre atacante
  });

  test('nao oferece lances enquanto a promocao esta pendente', () => {
    expect(getLegalMoves(position('7k/P7/8/8/8/8/8/K7', 'w', { pendingPromotion: [0, 0] }))).toEqual([]);
  });
});

describe('roque', () => {
  const kingside = move([7, 4], [7, 6]);
  const queenside = move([7, 4], [7, 2]);
  const bothRights = { whiteKingSide: true, whiteQueenSide: true };

  test('permite roque menor e maior quando as condicoes estao livres', () => {
    const moves = getLegalMoves(position('4k3/8/8/8/8/8/8/R3K2R', 'w', { castling: bothRights }));
    expect(moves).toContainEqual(kingside);
    expect(moves).toContainEqual(queenside);
  });

  test('bloqueia roque se o rei esta em xeque', () => {
    const moves = getLegalMoves(position('k3r3/8/8/8/8/8/8/R3K2R', 'w', { castling: bothRights }));
    expect(moves).not.toContainEqual(kingside);
    expect(moves).not.toContainEqual(queenside);
  });

  test('bloqueia roque quando uma casa entre rei e torre esta ocupada', () => {
    const moves = getLegalMoves(position('4k3/8/8/8/8/8/8/RN2K2R', 'w', { castling: bothRights }));
    expect(moves).not.toContainEqual(queenside);
  });

  test('bloqueia roque quando a casa de passagem esta atacada', () => {
    const moves = getLegalMoves(position('k4r2/8/8/8/8/8/8/4K2R', 'w', { castling: { whiteKingSide: true } }));
    expect(moves).not.toContainEqual(kingside);
  });

  test('bloqueia roque sem o direito correspondente', () => {
    const moves = getLegalMoves(position('4k3/8/8/8/8/8/8/R3K2R'));
    expect(moves).not.toContainEqual(kingside);
    expect(moves).not.toContainEqual(queenside);
  });

  test('bloqueia roque quando a torre esperada nao existe', () => {
    const moves = getLegalMoves(position('4k3/8/8/8/8/8/8/4K3', 'w', { castling: bothRights }));
    expect(moves).not.toContainEqual(kingside);
    expect(moves).not.toContainEqual(queenside);
  });
});

describe('en passant e captura', () => {
  test('gera e aplica en passant para os dois lados, removendo o peao da casa adjacente', () => {
    const white = position('k7/8/8/2pP4/8/8/8/7K', 'w', { enPassant: [2, 2] });
    const whiteMove = move([3, 3], [2, 2]);
    expect(getLegalMoves(white)).toContainEqual(whiteMove);
    const afterWhite = applyMove(white, whiteMove);
    expect(afterWhite.board[3][2]).toBeNull();
    expect(afterWhite.board[2][2]).toEqual({ type: 'p', color: 'w' });

    const black = position('7k/8/8/8/2pP4/8/8/K7', 'b', { enPassant: [5, 3] });
    const blackMove = move([4, 2], [5, 3]);
    expect(getLegalMoves(black)).toContainEqual(blackMove);
    const afterBlack = applyMove(black, blackMove);
    expect(afterBlack.board[4][3]).toBeNull();
    expect(afterBlack.board[5][3]).toEqual({ type: 'p', color: 'b' });
  });

  test('trata corretamente capturas en passant nas colunas a e h', () => {
    expect(getLegalMoves(position('k7/8/8/1Pp5/8/8/8/7K', 'w', { enPassant: [2, 2] })))
      .toContainEqual(move([3, 1], [2, 2]));
    expect(getLegalMoves(position('k7/8/8/5pP1/8/8/8/7K', 'w', { enPassant: [2, 5] })))
      .toContainEqual(move([3, 6], [2, 5]));
  });

  test('en passant expira depois do lance seguinte', () => {
    const state = position('k7/8/8/2pP4/8/8/8/7K', 'w', { enPassant: [2, 2] });
    const next = applyMove(state, move([3, 3], [2, 3]));
    expect(next.internal.enPassant).toBeNull();
    expect(getLegalMoves(next)).not.toContainEqual(move([3, 1], [2, 2]));
  });

  test('rejeita en passant que abriria ataque ao proprio rei', () => {
    const state = position('8/8/8/KPp4r/8/8/8/7k', 'w', { enPassant: [2, 2] });
    expect(getLegalMoves(state)).not.toContainEqual(move([3, 1], [2, 2]));
  });
});

describe('isSquareAttacked e isInCheck', () => {
  test('detecta ataques de peao, cavalo, rei, torre, bispo e dama', () => {
    const cases: [string, Square, Color][] = [
      ['8/8/8/8/4p3/8/8/4K3', [5, 3], 'b'],
      ['8/8/8/8/8/5n2/8/4K3', [6, 3], 'b'],
      ['8/8/8/8/8/5k2/8/4K3', [6, 4], 'b'],
      ['8/8/8/8/8/8/4r3/4K3', [7, 4], 'b'],
      ['8/8/8/8/8/5b2/8/4K3', [7, 3], 'b'],
      ['8/8/8/8/8/5q2/8/4K3', [5, 3], 'b'],
    ];
    for (const [fen, square, by] of cases) expect(isSquareAttacked(boardFromFen(fen), square, by)).toBe(true);
  });

  test('detecta ataques de peoes brancos e pretos em direcoes opostas', () => {
    expect(isSquareAttacked(boardFromFen('8/8/8/8/4P3/8/8/8'), [3, 3], 'w')).toBe(true);
    expect(isSquareAttacked(boardFromFen('8/8/8/4p3/8/8/8/8'), [4, 3], 'b')).toBe(true);
  });

  test('nao enxerga ataques de torre ou bispo bloqueados por outra peca', () => {
    expect(isSquareAttacked(boardFromFen('8/8/8/4r3/4P3/8/8/4K3'), [7, 4], 'b')).toBe(false);
    expect(isSquareAttacked(boardFromFen('8/8/8/8/3b4/4P3/8/4K3'), [7, 6], 'b')).toBe(false);
  });

  test('avalia ataques na borda e retorna false para xeque sem rei', () => {
    expect(isSquareAttacked(boardFromFen('r7/8/8/8/8/8/8/8'), [0, 7], 'b')).toBe(true);
    expect(isInCheck(boardFromFen('8/8/8/8/8/8/8/8'), 'w')).toBe(false);
  });
});
