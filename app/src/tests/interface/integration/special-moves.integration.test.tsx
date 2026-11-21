// @vitest-environment jsdom
import { useReducer } from "react";
import { describe, expect, it } from "vitest";
import { createGame, type GameState, type Piece } from "../../../engine";
import { Board } from "../../../interface/components/Board_Components/Board";
import { gameMovesReducer, toBoardState, toSquareId } from "../../../interface/hooks/useGameMoves";
import { click, render } from "../unit/harness";

function position(pieces: [number, number, Piece][]): GameState {
    const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
    for (const [row, col, piece] of pieces) board[row][col] = piece;
    return { ...createGame(), board };
}
async function boardFrom(game: GameState) {
    let current!: ReturnType<typeof gameMovesReducer>;
    function PositionBoard() {
        const [state, dispatch] = useReducer(gameMovesReducer, { game, snapshots: [game], history: [] });
        current = state;
        return <Board pieces={toBoardState(state.game)} selectedSquare={state.selected}
            onSquareSelect={(square) => dispatch({ type: "select", square })}
            promotionSquare={state.game.pendingPromotion ? toSquareId(state.game.pendingPromotion) : undefined}
            onPromotionSelect={(piece) => dispatch({ type: "promote", piece })} />;
    }
    const { container } = await render(<PositionBoard />);
    return { container, get current() { return current; }, square: (id: string) => container.querySelector<HTMLButtonElement>(`[data-squareid="${id}"]`)! };
}

describe("I-ESPECIAIS — tabuleiro, adaptador e regras reais", () => {
    it("move rei e torre no roque e registra o tipo de lance", async () => {
        const view = await boardFrom(position([
            [7, 4, { type: "k", color: "w" }], [7, 7, { type: "r", color: "w" }], [0, 4, { type: "k", color: "b" }],
        ]));
        await click(view.square("e1")); await click(view.square("g1"));
        expect(view.square("g1").getAttribute("aria-label")).toContain("rei");
        expect(view.square("f1").getAttribute("aria-label")).toContain("torre");
        expect(view.square("h1").getAttribute("aria-label")).toContain("vazia");
        expect(view.current.history[0].castle).toBe("kingSide");
    });
    it.each([["dama", "q", "queen"], ["cavalo", "n", "knight"]] as const)(
        "abre a escolha de promoção e troca o peão por %s", async (label, promotion, pieceType) => {
            const view = await boardFrom(position([
                [7, 0, { type: "k", color: "w" }], [0, 7, { type: "k", color: "b" }], [1, 0, { type: "p", color: "w" }],
            ]));
            await click(view.square("a7")); await click(view.square("a8"));
            expect(view.container.querySelector('[aria-label="Escolha a peça para promoção"]')).not.toBeNull();
            expect(view.current.game.turn).toBe("w");
            await click(view.container.querySelector(`button[aria-label="Promover para ${label}"]`));
            expect(toBoardState(view.current.game).a8?.piece.type).toBe(pieceType);
            expect(view.current.game.turn).toBe("b");
            expect(view.current.history[0].promotion).toBe(promotion);
            expect(view.container.querySelector('[aria-label="Escolha a peça para promoção"]')).toBeNull();
        });
});
