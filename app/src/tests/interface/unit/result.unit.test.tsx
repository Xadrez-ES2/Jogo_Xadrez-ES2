// @vitest-environment jsdom
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { GameResultModal } from "../../../interface/components/GameResultModal";
import { click, render } from "./harness";

// O diálogo nativo é testável separadamente; aqui o foco é o resultado e suas ações.
vi.mock("../../../interface/components/ui/Modal", () => ({
    Modal: ({ title, children }: { title: string; children: ReactNode }) => <section aria-label={title}>{children}</section>,
}));
describe("U-RESULT — resultado apresentado ao jogador", () => {
    it.each([["victory", "Vitória"], ["defeat", "Derrota"], ["draw", "Empate"]] as const)(
        "exibe %s com motivo e ações", async (outcome, title) => {
            const onClose = vi.fn(), onRestart = vi.fn();
            const { container } = await render(<MemoryRouter><GameResultModal
                result={{ outcome, reason: "Motivo informado pela partida" }} onClose={onClose} onRestart={onRestart}>
                <p>Estado do salvamento</p>
            </GameResultModal></MemoryRouter>);
            expect(container.querySelector("section")?.getAttribute("aria-label")).toBe(title);
            expect(container.textContent).toContain("Motivo informado pela partida");
            expect(container.textContent).toContain("Estado do salvamento");
            await click(container.querySelector("button"));
            expect(onRestart).toHaveBeenCalledTimes(1);
            await click(container.querySelectorAll("button")[1]);
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(container.querySelector("a")?.getAttribute("href")).toBe("/");
        });
    it("impede reinício durante o salvamento", async () => {
        const onRestart = vi.fn();
        const { container } = await render(<MemoryRouter><GameResultModal result={{ outcome: "draw", reason: "Empate" }}
            onRestart={onRestart} onClose={vi.fn()} restartingDisabled /></MemoryRouter>);
        const button = container.querySelector("button")!;
        expect(button.disabled).toBe(true);
        await click(button);
        expect(onRestart).not.toHaveBeenCalled();
    });
});
