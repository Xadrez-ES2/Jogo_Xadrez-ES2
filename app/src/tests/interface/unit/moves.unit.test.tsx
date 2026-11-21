// @vitest-environment jsdom
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState, Piece, Square } from "../../../engine";
import { createMoveState, gameMovesReducer, toBoardState, toEngineSquare, toSquareId, useGameMoves } from "../../../interface/hooks/useGameMoves";
import { useHistoryNavigation } from "../../../interface/hooks/useHistoryNavigation";
import { mountHook } from "./harness";

const engine = vi.hoisted(() => ({
    createGame: vi.fn(), getLegalMoves: vi.fn(), getPiece: vi.fn(), sameSquare: vi.fn(),
    applyMove: vi.fn(), promotePawn: vi.fn(),
}));
vi.mock("../../../engine", () => engine);

function fixture(turn: "w" | "b" = "w"): GameState {
    const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
    board[6][4] = { type: "p", color: "w" };
    board[1][4] = { type: "p", color: "b" };
    return { board, turn, pendingPromotion: null, internal: {
        castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
        enPassant: null, halfmoveClock: 0, fullmoveNumber: 1,
    } };
}
const e4 = { from: [6, 4] as Square, to: [4, 4] as Square };
beforeEach(() => {
    vi.resetAllMocks();
    engine.createGame.mockImplementation(() => fixture());
    engine.getLegalMoves.mockReturnValue([e4]);
    engine.getPiece.mockImplementation((board: GameState["board"], square: Square) => board[square[0]][square[1]]);
    engine.sameSquare.mockImplementation((a: Square, b: Square) => a[0] === b[0] && a[1] === b[1]);
    engine.applyMove.mockReturnValue(fixture("b"));
});

describe("U-MOV — contrato da interface com a engine substituída", () => {
    it.each([["a8", [0, 0]], ["h1", [7, 7]], ["e2", [6, 4]]] as const)(
        "converte %s sem inverter linha e coluna", (id, coordinate) => {
            expect(toEngineSquare(id)).toEqual(coordinate);
            expect(toSquareId(coordinate)).toBe(id);
        });
    it("converte peças e cores para a apresentação sem modificar o estado", () => {
        const game = fixture();
        const before = structuredClone(game);
        expect(toBoardState(game)).toEqual({
            e2: { piece: { type: "pawn" }, color: "white" },
            e7: { piece: { type: "pawn" }, color: "black" },
        });
        expect(game).toEqual(before);
    });
    it("ignora peça da outra cor, alterna seleção e rejeita destino não autorizado", () => {
        const state = createMoveState();
        expect(gameMovesReducer(state, { type: "select", square: "e7" })).toBe(state);
        const selected = gameMovesReducer(state, { type: "select", square: "e2" });
        expect(selected.selected).toBe("e2");
        expect(gameMovesReducer(selected, { type: "select", square: "e5" })).toBe(selected);
        expect(engine.applyMove).not.toHaveBeenCalled();
        expect(gameMovesReducer(selected, { type: "select", square: "e2" }).selected).toBeUndefined();
    });
    it("aplica apenas um lance autorizado e registra histórico, snapshot e animação", () => {
        const state = { ...createMoveState(), selected: "e2" as const };
        const next = gameMovesReducer(state, { type: "select", square: "e4" });
        expect(engine.applyMove).toHaveBeenCalledExactlyOnceWith(state.game, e4);
        expect(next.game).toBe(engine.applyMove.mock.results[0].value);
        expect(next.history).toEqual([expect.objectContaining({ from: "e2", to: "e4", color: "white", piece: "pawn", capture: false })]);
        expect(next.snapshots).toEqual([state.game, next.game]);
        expect(next.animatingMove).toMatchObject({ from: "e2", to: "e4" });
        expect(next.selected).toBeUndefined();
        expect(state.history).toEqual([]);
    });
    it("registra a peça capturada informada pela engine", () => {
        const initial = createMoveState();
        engine.getPiece.mockImplementation((_board: GameState["board"], square: Square) =>
            square[0] === 6 ? { type: "p", color: "w" } : { type: "n", color: "b" });
        const next = gameMovesReducer(initial, { type: "play", move: e4 });
        expect(next.history[0]).toMatchObject({ capture: true, capturedPiece: "knight" });
    });
    it("desfaz até o início sem ultrapassar os snapshots", () => {
        const initial = createMoveState();
        const played = gameMovesReducer(initial, { type: "play", move: e4 });
        const undone = gameMovesReducer(played, { type: "undo", plies: 100 });
        expect(undone.game).toBe(initial.game);
        expect(undone.history).toEqual([]);
        expect(undone.snapshots).toEqual([initial.game]);
        expect(undone.animatingMove).toBeNull();
    });
    it("atualiza o último registro e snapshot ao escolher uma promoção", () => {
        const initial = createMoveState();
        const played = gameMovesReducer(initial, { type: "play", move: e4 });
        const pending = { ...played, game: { ...played.game, pendingPromotion: [0, 4] as Square } };
        const promoted = fixture("b");
        engine.promotePawn.mockReturnValue(promoted);
        const next = gameMovesReducer(pending, { type: "promote", piece: "q" });
        expect(engine.promotePawn).toHaveBeenCalledExactlyOnceWith(pending.game, "q");
        expect(next.history.at(-1)?.promotion).toBe("q");
        expect(next.snapshots.at(-1)).toBe(promoted);
        expect(next.animatingMove).toBeNull();
        expect(gameMovesReducer(initial, { type: "promote", piece: "q" })).toBe(initial);
    });
    it("limpa seleção, animação e reinicia o estado da interface", () => {
        const played = gameMovesReducer(createMoveState(), { type: "play", move: e4 });
        expect(gameMovesReducer(played, { type: "clearAnimation" }).animatingMove).toBeNull();
        expect(gameMovesReducer({ ...played, selected: "e7" }, { type: "clear" }).selected).toBeUndefined();
        const reset = gameMovesReducer(played, { type: "reset" });
        expect(reset.history).toEqual([]);
        expect(reset.snapshots).toHaveLength(1);
    });
    it("expõe os destinos somente da peça selecionada", async () => {
        engine.getLegalMoves.mockReturnValue([e4, { from: [7, 1], to: [5, 2] }]);
        const hook = await mountHook(useGameMoves, undefined);
        expect(hook.current.legalMoves).toEqual([]);
        await act(async () => hook.current.handleSquareSelect("e2"));
        expect(hook.current.legalMoves).toEqual(["e4"]);
        await act(async () => hook.current.handleSquareSelect("e4"));
        expect(hook.current.activeColor).toBe("black");
        expect(hook.current.lastMove?.to).toBe("e4");
    });
});

describe("U-HIST — navegação visual isolada do jogo real", () => {
    it("não recua nem avança quando não existem lances", async () => {
        const hook = await mountHook(() => useHistoryNavigation([fixture()], []), undefined);
        await act(async () => { hook.current.goBack(); hook.current.goForward(); hook.current.goToStart(); });
        expect(hook.current.isViewingHistory).toBe(false);
    });
    it("respeita os limites e retorna ao vivo sem modificar os snapshots", async () => {
        const snapshots = [fixture(), fixture("b"), fixture()];
        const history = [
            { from: "e2", to: "e4", color: "white", piece: "pawn", capture: false },
            { from: "e7", to: "e5", color: "black", piece: "pawn", capture: false },
        ] as const;
        const before = structuredClone(snapshots);
        const hook = await mountHook(() => useHistoryNavigation(snapshots, [...history]), undefined);
        await act(async () => hook.current.goToStart());
        await act(async () => hook.current.goBack());
        expect(hook.current.effectiveIndex).toBe(0);
        expect(hook.current.viewLastMove).toBeUndefined();
        await act(async () => hook.current.goForward());
        expect(hook.current.focusedMoveIndex).toBe(0);
        expect(hook.current.viewLastMove).toEqual(history[0]);
        await act(async () => hook.current.goForward());
        expect(hook.current.isViewingHistory).toBe(false);
        await act(async () => hook.current.navigateTo(1));
        expect(hook.current.viewGame).toBe(snapshots[1]);
        await act(async () => hook.current.returnToLive());
        expect(hook.current.viewIndex).toBeNull();
        expect(snapshots).toEqual(before);
    });
});

describe("U-MOV-ESPECIAL — registro de lances especiais com engine substituída", () => {
    function withPieces(turn: "w" | "b", pieces: [number, number, Piece][], enPassant: Square | null = null): GameState {
        const base = fixture(turn);
        const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
        for (const [row, col, piece] of pieces) board[row][col] = piece;
        return { ...base, board, internal: { ...base.internal, enPassant } };
    }
    const stateOf = (game: GameState) => ({ game, history: [], snapshots: [game], animatingMove: null });

    it.each([
        ["brancas", "w", [3, 4], [2, 3], "b"],
        ["pretas", "b", [4, 3], [5, 4], "w"],
    ] as const)("registra en passant das %s como captura de peão", (_name, turn, from, to, victim) => {
        const game = withPieces(turn, [[from[0], from[1], { type: "p", color: turn }]], [...to] as Square);
        const next = gameMovesReducer(stateOf(game), { type: "play", move: { from: [...from] as Square, to: [...to] as Square } });
        expect(next.history[0]).toMatchObject({ capture: true, capturedPiece: "pawn" });
        expect(victim).not.toBe(turn);
    });
    it("não registra captura em diagonal sem alvo en passant correspondente", () => {
        const pawn: Piece = { type: "p", color: "w" };
        const noTarget = gameMovesReducer(stateOf(withPieces("w", [[3, 4, pawn]])), { type: "play", move: { from: [3, 4], to: [2, 3] } });
        const otherTarget = gameMovesReducer(stateOf(withPieces("w", [[3, 4, pawn]], [2, 5])), { type: "play", move: { from: [3, 4], to: [2, 3] } });
        const straight = gameMovesReducer(stateOf(withPieces("w", [[3, 4, pawn]], [2, 4])), { type: "play", move: { from: [3, 4], to: [2, 4] } });
        const bishop = gameMovesReducer(stateOf(withPieces("w", [[3, 4, { type: "b", color: "w" }]], [2, 3])), { type: "play", move: { from: [3, 4], to: [2, 3] } });
        for (const state of [noTarget, otherTarget, straight, bishop]) expect(state.history[0].capture).toBe(false);
    });
    it.each([[[7, 6], "kingSide"], [[7, 2], "queenSide"], [[7, 5], undefined]] as const)(
        "identifica o roque pelo deslocamento do rei até %s", (to, castle) => {
            const game = withPieces("w", [[7, 4, { type: "k", color: "w" }]]);
            const next = gameMovesReducer(stateOf(game), { type: "play", move: { from: [7, 4], to: [...to] as Square } });
            expect(next.history[0].castle).toBe(castle);
        });
    it("aplica a promoção escolhida pela IA junto com o lance", () => {
        const promoted = fixture("b");
        engine.promotePawn.mockReturnValue(promoted);
        const game = withPieces("w", [[1, 0, { type: "p", color: "w" }]]);
        const next = gameMovesReducer(stateOf(game), { type: "play", move: { from: [1, 0], to: [0, 0] }, promotion: "n" });
        expect(engine.promotePawn).toHaveBeenCalledExactlyOnceWith(engine.applyMove.mock.results[0].value, "n");
        expect(next.game).toBe(promoted);
        expect(next.history[0].promotion).toBe("n");
    });
    it("altera somente o último registro ao promover com histórico longo", () => {
        let state = gameMovesReducer(createMoveState(), { type: "play", move: e4 });
        state = gameMovesReducer(state, { type: "play", move: e4 });
        engine.promotePawn.mockReturnValue(fixture("b"));
        const next = gameMovesReducer({ ...state, game: { ...state.game, pendingPromotion: [0, 4] } }, { type: "promote", piece: "r" });
        expect(next.history.map((move) => move.promotion)).toEqual([undefined, "r"]);
    });
    it("o hook expõe promoção pendente, desfazer, escolha de promoção e reinício", async () => {
        engine.applyMove.mockReturnValue({ ...fixture("b"), pendingPromotion: [0, 4] });
        engine.promotePawn.mockReturnValue(fixture("b"));
        const hook = await mountHook(useGameMoves, undefined);
        await act(async () => hook.current.playAIMove(e4));
        expect(hook.current.pendingPromotion).toBe("e8");
        await act(async () => hook.current.choosePromotion("q"));
        expect(hook.current.pendingPromotion).toBeUndefined();
        expect(hook.current.lastMove?.promotion).toBe("q");
        await act(async () => hook.current.undo(1));
        expect(hook.current.history).toEqual([]);
        await act(async () => hook.current.playAIMove(e4));
        await act(async () => hook.current.clearAnimation());
        expect(hook.current.animatingMove).toBeUndefined();
        await act(async () => hook.current.resetMoves());
        expect(hook.current.history).toEqual([]);
    });
});

describe("U-HIST-LIMITES — navegação com dados incompletos", () => {
    const history = [
        { from: "e2", to: "e4", color: "white", piece: "pawn", capture: false },
        { from: "e7", to: "e5", color: "black", piece: "pawn", capture: false },
    ] as const;
    it("avança a partir do vivo, navega além do fim e tolera snapshot ausente", async () => {
        const hook = await mountHook(() => useHistoryNavigation([fixture()], [...history]), undefined);
        expect(hook.current.viewGame).toBeUndefined();
        expect(hook.current.viewPieces).toBeUndefined();
        await act(async () => hook.current.goForward());
        expect(hook.current.isViewingHistory).toBe(false);
        await act(async () => hook.current.navigateTo(0));
        expect(hook.current.viewIndex).toBe(0);
        await act(async () => hook.current.navigateTo(5));
        expect(hook.current.viewIndex).toBeNull();
        await act(async () => { hook.current.navigateTo(0); });
        await act(async () => hook.current.goToEnd());
        expect(hook.current.isViewingHistory).toBe(false);
    });
});
