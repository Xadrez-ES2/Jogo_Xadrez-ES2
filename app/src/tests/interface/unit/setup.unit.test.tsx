// @vitest-environment jsdom
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { GameSetupForm } from "../../../interface/components/GameSetupForm";
import { click, render } from "./harness";

describe("U-CONF — configuração da partida sem iniciar engine ou IA", () => {
    it.each(["human-ai", "human-human", "ai-ai"])("submete o modo %s", async (mode) => {
        const onStart = vi.fn();
        const { container } = await render(<GameSetupForm onStart={onStart} />);
        await click(container.querySelector(`input[value="${mode}"]`));
        await click(container.querySelector('button[type="submit"]'));
        expect(onStart).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ mode }));
        if (mode === "human-human") {
            expect(container.querySelector("select")).toBeNull();
            expect(onStart.mock.calls[0][0].playerColor).toBeUndefined();
        }
    });
    it.each(["easy", "medium", "hard"])("entrega a dificuldade %s ao iniciar", async (difficulty) => {
        const onStart = vi.fn();
        const { container } = await render(<GameSetupForm onStart={onStart} />);
        const select = container.querySelector("select")!;
        await act(async () => {
            select.value = difficulty;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        });
        await click(container.querySelector('button[type="submit"]'));
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ difficulty }));
    });
    it.each([["10min", 600000], ["5min", 300000], ["2min", 120000], ["1min", 60000], ["none", null]])(
        "converte a opção %s para %s ms", async (timeOption, timeLimitMs) => {
            const onStart = vi.fn();
            const { container } = await render(<GameSetupForm onStart={onStart} />);
            await click(container.querySelector(`input[value="${timeOption}"]`));
            await click(container.querySelector('button[type="submit"]'));
            expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ timeOption, timeLimitMs }));
        });
    it.each(["white", "black"])("preserva a escolha explícita da cor %s", async (playerColor) => {
        const onStart = vi.fn();
        const { container } = await render(<GameSetupForm onStart={onStart} />);
        await click(container.querySelector(`input[name="player-color"][value="${playerColor}"]`));
        await click(container.querySelector('button[type="submit"]'));
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ playerColor }));
    });
    it.each([[0.1, "white"], [0.9, "black"]])("resolve a cor aleatória com sorteio %s", async (random, playerColor) => {
        vi.spyOn(Math, "random").mockReturnValue(random);
        const onStart = vi.fn();
        const { container } = await render(<GameSetupForm onStart={onStart} />);
        await click(container.querySelector('button[type="submit"]'));
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ playerColor }));
    });
});
