// @vitest-environment jsdom
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { useChessClock } from "../../../interface/hooks/useChessClock";
import { ChessClock } from "../../../interface/components/Board_Components/ChessClock";
import { mountHook, render } from "./harness";

const advance = async (ms: number) => { await act(async () => vi.advanceTimersByTime(ms)); };
function options() {
    return { activeColor: "white" as "white" | "black", running: true, resetKey: 0,
        initialTimeMs: 5000 as number | null, onTimeout: vi.fn() };
}

describe("U-REL — controle do relógio isolado", () => {
    it("desconta apenas da cor ativa e alterna sem perder frações", async () => {
        vi.useFakeTimers();
        const props = options();
        const hook = await mountHook(useChessClock, props);
        await advance(1250);
        await hook.rerender({ ...props, activeColor: "black" });
        expect(hook.current).toEqual({ white: 3750, black: 5000 });
        await advance(700);
        expect(hook.current).toEqual({ white: 3750, black: 4300 });
        expect(props.onTimeout).not.toHaveBeenCalled();
    });
    it("congela na pausa e retoma do tempo restante", async () => {
        vi.useFakeTimers();
        const props = options();
        const hook = await mountHook(useChessClock, props);
        await advance(350);
        await hook.rerender({ ...props, running: false });
        await advance(2000);
        expect(hook.current).toEqual({ white: 4650, black: 5000 });
        await hook.rerender(props);
        await advance(200);
        expect(hook.current?.white).toBe(4450);
    });
    it("limita em zero e avisa o encerramento uma única vez", async () => {
        vi.useFakeTimers();
        const props = options();
        const hook = await mountHook(useChessClock, props);
        await advance(6000);
        await advance(1000);
        expect(hook.current).toEqual({ white: 0, black: 5000 });
        expect(props.onTimeout).toHaveBeenCalledExactlyOnceWith("white");
    });
    it("reinicia ambos os tempos e permite um novo aviso de encerramento", async () => {
        vi.useFakeTimers();
        const props = options();
        const hook = await mountHook(useChessClock, props);
        await advance(5000);
        await hook.rerender({ ...props, resetKey: 1 });
        expect(hook.current).toEqual({ white: 5000, black: 5000 });
        await advance(5000);
        expect(props.onTimeout).toHaveBeenCalledTimes(2);
    });
    it("não agenda intervalos nem timeout em partida sem tempo", async () => {
        vi.useFakeTimers();
        const props = { ...options(), initialTimeMs: null };
        const hook = await mountHook(useChessClock, props);
        expect(hook.current).toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
        await advance(60000);
        expect(props.onTimeout).not.toHaveBeenCalled();
    });
    it("cancela o intervalo ao desmontar", async () => {
        vi.useFakeTimers();
        const hook = await mountHook(useChessClock, options());
        expect(vi.getTimerCount()).toBe(1);
        await hook.unmount();
        expect(vi.getTimerCount()).toBe(0);
    });
});

describe("U-REL-VIS — apresentação do relógio", () => {
    it.each([
        [600000, "10:00"], [59999, "01:00"], [1, "00:01"], [0, "00:00"],
        [-1000, "00:00"], [3661000, "1:01:01"],
    ])("apresenta %i ms como %s", async (remainingMs, expected) => {
        const { container } = await render(<ChessClock remainingMs={remainingMs} active playerName="Ana" />);
        expect(container.querySelector('[role="timer"]')?.textContent).toBe(expected);
        expect(container.querySelector('[role="timer"]')?.getAttribute("aria-label")).toContain("Ana");
    });
    it("informa se está parado e destaca o tempo baixo", async () => {
        const { container } = await render(<ChessClock remainingMs={30000} active={false} playerName="Ana" />);
        expect(container.firstElementChild?.getAttribute("aria-label")).toContain("relógio parado");
        expect(container.firstElementChild?.className).toContain("border-danger");
    });
});
