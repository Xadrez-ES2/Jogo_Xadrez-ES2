// Issue: Teste Unitario MinMax
import { describe, expect, test, vi } from "vitest";
import type { GameState } from "../../engine";
import { applyMove, createGame, getGameStatus } from "../../engine";
import { evaluate } from "../../ai/evaluation";
import { generateMoves } from "../../ai/moveGeneration";
import { alphaBeta, findBestMove } from "../../ai/search";
import { PIECE_VALUES } from "../../ai/criteria";
import * as pos from "./aiHelpers";

const { stateFromFen } = pos;

// MinMax sem poda, usado so para comparar com o alpha-beta
function minimax(state: GameState, depth: number, ply = 0): number {
  const moves = generateMoves(state);
  if (moves.length === 0) {
    if (getGameStatus(state) !== "checkmate") return 0;
    return state.turn === "w" ? -100000 + ply : 100000 - ply;
  }
  if (depth === 0) return evaluate(state);
  const scores = moves.map((move) =>
    minimax(applyMove(state, move), depth - 1, ply + 1),
  );
  return state.turn === "w" ? Math.max(...scores) : Math.min(...scores);
}

describe("Geracao de lances", () => {
  test("posicao inicial tem 20 lances", () => {
    expect(generateMoves(createGame())).toHaveLength(20);
  });

  test("capturas mais valiosas vem primeiro", () => {
    const moves = generateMoves(stateFromFen(pos.HANGING_QUEEN));
    expect(moves[0].to).toEqual([3, 3]); // dama
    expect(moves[1].to).toEqual([6, 1]); // peao
  });
});

describe("alphaBeta", () => {
  test("profundidade 0 devolve a avaliacao", () => {
    const state = stateFromFen(pos.HANGING_QUEEN);
    expect(alphaBeta(state, 0, -Infinity, Infinity)).toBe(evaluate(state));
  });

  test("regra dos 50 lances: 99 avalia, 100 empata", () => {
    const before = stateFromFen(pos.HANGING_QUEEN, "w", 99);
    expect(alphaBeta(before, 0, -Infinity, Infinity)).toBe(evaluate(before));
    expect(
      alphaBeta(
        stateFromFen(pos.HANGING_QUEEN, "w", 100),
        0,
        -Infinity,
        Infinity,
      ),
    ).toBe(0);
    expect(
      alphaBeta(
        stateFromFen(pos.HANGING_QUEEN, "w", 100),
        2,
        -Infinity,
        Infinity,
      ),
    ).toBe(0);
  });

  test("xeque-mate, afogamento e mate mais rapido", () => {
    expect(alphaBeta(stateFromFen(pos.MATED), 2, -Infinity, Infinity)).toBe(
      -100000,
    );
    expect(
      alphaBeta(stateFromFen(pos.STALEMATE, "b"), 2, -Infinity, Infinity),
    ).toBe(0);
    expect(
      alphaBeta(stateFromFen(pos.WHITE_MATE_IN_1), 1, -Infinity, Infinity),
    ).toBe(99999);
  });

  test("poda da o mesmo resultado que o MinMax puro", () => {
    for (const turn of ["w", "b"] as const) {
      const state = stateFromFen(pos.MIDDLEGAME, turn);
      expect(alphaBeta(state, 3, -Infinity, Infinity)).toBe(minimax(state, 3));
    }
  }, 30_000); // o MinMax puro e lento, por isso o tempo maior
});

describe("findBestMove", () => {
  test("sem lances devolve null", () => {
    expect(findBestMove(stateFromFen(pos.MATED), 2)).toBeNull();
  });

  test("acha mate em 1 para brancas e pretas, em qualquer profundidade", () => {
    expect(findBestMove(stateFromFen(pos.WHITE_MATE_IN_1), 1)).toEqual({
      from: [7, 0],
      to: [0, 0],
    });
    expect(findBestMove(stateFromFen(pos.WHITE_MATE_IN_1), 3)).toEqual({
      from: [7, 0],
      to: [0, 0],
    });
    expect(findBestMove(stateFromFen(pos.BLACK_MATE_IN_1, "b"), 1)).toEqual({
      from: [0, 0],
      to: [7, 0],
    });
  });

  test("captura a dama solta", () => {
    expect(findBestMove(stateFromFen(pos.HANGING_QUEEN), 1)).toEqual({
      from: [6, 3],
      to: [3, 3],
    });
  });

  test("promove o peao para dama, brancas e pretas", () => {
    const white = stateFromFen(pos.PROMOTION);
    expect(findBestMove(white, 1)).toEqual({ from: [1, 0], to: [0, 0] });
    expect(alphaBeta(white, 1, -Infinity, Infinity)).toBe(PIECE_VALUES.q); // reis se anulam
    const black = stateFromFen("k7/8/8/8/8/8/p7/7K", "b");
    expect(findBestMove(black, 1)).toEqual({ from: [6, 0], to: [7, 0] });
    expect(alphaBeta(black, 1, -Infinity, Infinity)).toBe(-PIECE_VALUES.q);
  });

  test("no empate prefere promover agora a promover depois", () => {
    // Na profundidade 3, promover agora ou no proximo lance da a mesma nota
    vi.spyOn(Math, "random").mockReturnValue(0.99); // sorteio pegaria o ultimo empatado
    expect(findBestMove(stateFromFen(pos.PROMOTION), 3)).toEqual({
      from: [1, 0],
      to: [0, 0],
    });
    vi.restoreAllMocks();
  });
});
