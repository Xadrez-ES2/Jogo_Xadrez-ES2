// @vitest-environment jsdom
import { act, type MouseEvent as ReactMouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useBoardArrows } from "../../../interface/hooks/useBoardArrows";
import { mountHook } from "./harness";

function mouse(button = 2) {
    return { button, preventDefault: vi.fn() } as unknown as ReactMouseEvent;
}
describe("U-ANOT — anotações do tabuleiro", () => {
    it("alterna o destaque com botão direito na mesma casa", async () => {
        const hook = await mountHook(useBoardArrows, undefined);
        const event = mouse();
        for (const expected of [["e4"], []]) {
            await act(async () => {
                hook.current.handleSquareContextMouseDown("e4", event);
                hook.current.handleSquareContextMouseUp("e4", event);
            });
            expect(hook.current.highlightedSquares).toEqual(expected);
        }
        expect(event.preventDefault).toHaveBeenCalled();
    });
    it("desenha e remove uma seta repetida", async () => {
        const hook = await mountHook(useBoardArrows, undefined);
        for (const expected of [[{ from: "e2", to: "e4" }], []]) {
            await act(async () => {
                hook.current.handleSquareContextMouseDown("e2", mouse());
                hook.current.handleSquareContextMouseUp("e4", mouse());
            });
            expect(hook.current.arrows).toEqual(expected);
        }
    });
    it("ignora o botão esquerdo e mouseup sem início", async () => {
        const hook = await mountHook(useBoardArrows, undefined);
        await act(async () => {
            hook.current.handleSquareContextMouseDown("e2", mouse(0));
            hook.current.handleSquareContextMouseUp("e4", mouse(0));
            hook.current.handleSquareContextMouseUp("e4", mouse());
        });
        expect(hook.current.arrows).toEqual([]);
        expect(hook.current.highlightedSquares).toEqual([]);
    });
    it("cancela o arraste ao soltar fora do tabuleiro", async () => {
        const hook = await mountHook(useBoardArrows, undefined);
        await act(async () => {
            hook.current.handleSquareContextMouseDown("e2", mouse());
            window.dispatchEvent(new MouseEvent("mouseup", { button: 2 }));
            hook.current.handleSquareContextMouseUp("e4", mouse());
        });
        expect(hook.current.arrows).toEqual([]);
    });
    it("limpa setas e destaques existentes", async () => {
        const hook = await mountHook(useBoardArrows, undefined);
        await act(async () => {
            hook.current.handleSquareContextMouseDown("a1", mouse());
            hook.current.handleSquareContextMouseUp("a1", mouse());
            hook.current.handleSquareContextMouseDown("e2", mouse());
            hook.current.handleSquareContextMouseUp("e4", mouse());
        });
        expect(hook.current.arrows).toHaveLength(1);
        expect(hook.current.highlightedSquares).toHaveLength(1);
        await act(async () => hook.current.clearAnnotations());
        expect(hook.current.arrows).toEqual([]);
        expect(hook.current.highlightedSquares).toEqual([]);
    });
});
