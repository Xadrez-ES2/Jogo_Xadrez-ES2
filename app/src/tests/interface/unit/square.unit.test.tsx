// @vitest-environment jsdom
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { Square } from "../../../interface/components/Board_Components/Square";
import { click, render } from "./harness";

describe("U-CASA — interação e indicadores de uma casa", () => {
    it("anuncia a casa vazia e entrega sua coordenada ao selecionar", async () => {
        const onSelect = vi.fn();
        const { container } = await render(<Square id="e4" isLight onSelect={onSelect} />);
        const button = container.querySelector("button")!;
        expect(button.getAttribute("aria-label")).toBe("Casa e4, vazia");
        expect(button.getAttribute("aria-pressed")).toBe("false");
        await click(button);
        expect(onSelect).toHaveBeenCalledExactlyOnceWith("e4");
    });
    it("marca seleção e destino livre sem exibir marcador de captura", async () => {
        const { container } = await render(<Square id="e4" isLight isSelected isLegalMove />);
        expect(container.querySelector("button")?.getAttribute("aria-pressed")).toBe("true");
        expect(container.querySelector('[data-move-destination="true"]')).not.toBeNull();
        expect(container.querySelector('[data-move-indicator="move"]')).not.toBeNull();
        expect(container.querySelector('[data-move-indicator="capture"]')).toBeNull();
    });
    it("anuncia a peça adversária e diferencia o destino de captura", async () => {
        const { container } = await render(<Square id="d5" isLight={false} isLegalMove
            piece={{ piece: { type: "pawn" }, color: "black" }} />);
        expect(container.querySelector("button")?.getAttribute("aria-label")).toBe("Casa d5, peça preta: peão");
        expect(container.querySelector('[data-move-indicator="capture"]')).not.toBeNull();
        expect(container.querySelector('[data-move-indicator="move"]')).toBeNull();
    });
    it("bloqueia seleção e anotações quando desabilitada", async () => {
        const onSelect = vi.fn(), onDown = vi.fn(), onUp = vi.fn();
        const { container } = await render(<Square id="e4" isLight disabled onSelect={onSelect}
            onContextMouseDown={onDown} onContextMouseUp={onUp} />);
        const button = container.querySelector("button")!;
        await click(button);
        await act(async () => {
            button.dispatchEvent(new MouseEvent("mousedown", { button: 2, bubbles: true }));
            button.dispatchEvent(new MouseEvent("mouseup", { button: 2, bubbles: true }));
        });
        expect(button.disabled).toBe(true);
        expect(onSelect).not.toHaveBeenCalled();
        expect(onDown).not.toHaveBeenCalled();
        expect(onUp).not.toHaveBeenCalled();
    });
    it("encaminha anotações e impede o menu de contexto do navegador", async () => {
        const onDown = vi.fn(), onUp = vi.fn();
        const { container } = await render(<Square id="a1" isLight={false}
            onContextMouseDown={onDown} onContextMouseUp={onUp} />);
        const button = container.querySelector("button")!;
        const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
        await act(async () => {
            button.dispatchEvent(new MouseEvent("mousedown", { button: 2, bubbles: true }));
            button.dispatchEvent(new MouseEvent("mouseup", { button: 2, bubbles: true }));
            button.dispatchEvent(menu);
        });
        expect(onDown).toHaveBeenCalledWith("a1", expect.objectContaining({ button: 2 }));
        expect(onUp).toHaveBeenCalledWith("a1", expect.objectContaining({ button: 2 }));
        expect(menu.defaultPrevented).toBe(true);
    });
    it("oculta a imagem da peça durante o voo, mantendo sua descrição acessível", async () => {
        const { container } = await render(<Square id="e4" isLight isAnimatingPiece
            piece={{ piece: { type: "queen" }, color: "white" }} />);
        expect(container.querySelector("img")).toBeNull();
        expect(container.querySelector("button")?.getAttribute("aria-label")).toContain("dama");
    });
});
