// @vitest-environment jsdom
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../../../interface/pages/Game";
import { AuthProvider } from "../../../interface/stores/AuthContext";
import { MatchHistoryProvider } from "../../../interface/stores/MatchHistoryContext";
import type { AuthService } from "../../../interface/types/auth";
import { click, render } from "../unit/harness";

// Engine real; autenticação de visitante e histórico controlados, sem Firebase.
const sounds: string[] = [];
beforeEach(() => {
    sounds.length = 0;
    vi.useFakeTimers();
    vi.stubGlobal("Audio", class {
        preload = ""; volume = 0;
        src: string;
        constructor(src: string) { this.src = src; }
        play() { sounds.push(this.src); return Promise.resolve(); }
    });
    Object.defineProperties(HTMLDialogElement.prototype, {
        showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
        close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } },
    });
});
const guest: AuthService = { configured: false, subscribe: () => () => {}, signIn: vi.fn(), signOut: vi.fn() };

async function localGame() {
    const { container } = await render(<MemoryRouter><AuthProvider service={guest}>
        <MatchHistoryProvider service={{ configured: false, save: vi.fn(), subscribe: () => () => {} }}><Game /></MatchHistoryProvider>
    </AuthProvider></MemoryRouter>);
    await click(container.querySelector('input[value="human-human"]'));
    await click(container.querySelector('input[value="none"]'));
    await click(container.querySelector('button[type="submit"]'));
    const square = (id: string) => container.querySelector<HTMLButtonElement>(`[data-squareid="${id}"]`)!;
    const label = (id: string) => square(id).getAttribute("aria-label") ?? "";
    const play = async (...moves: string[]) => {
        for (const move of moves) { await click(square(move.slice(0, 2))); await click(square(move.slice(2))); }
    };
    const action = (name: string) => click(container.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`));
    const textButton = (text: string) => click([...container.querySelectorAll("button")].find((node) => node.textContent === text) ?? null);
    const key = (name: string, target: EventTarget = window) =>
        act(async () => { target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true })); });
    return { container, square, label, play, action, textButton, key };
}
const lastSound = () => sounds.at(-1) ?? "";

describe("I-JOGO — fluxo da página de partida com engine real", () => {
    it("navega pelo histórico com as setas do teclado", async () => {
        const view = await localGame();
        await view.key("ArrowUp");
        expect(view.label("e2")).toContain("peão");
        await view.play("e2e4", "e7e5");
        await view.key("ArrowUp");
        expect(view.label("e2")).toContain("peão");
        expect(view.label("e7")).toContain("peão");
        await view.key("ArrowRight");
        expect(view.label("e4")).toContain("peão");
        expect(view.label("e7")).toContain("peão");
        await view.key("ArrowDown");
        expect(view.label("e5")).toContain("peão");
        await view.key("ArrowLeft");
        expect(view.label("e5")).toContain("vazia");
        await view.key("Enter");
        expect(view.label("e5")).toContain("vazia");
    });
    it("não intercepta as setas em campos de formulário nem com modal aberto", async () => {
        const view = await localGame();
        await view.play("e2e4", "e7e5");
        const input = document.createElement("input");
        document.body.append(input);
        await view.key("ArrowUp", input);
        expect(view.label("e4")).toContain("peão");
        await view.action("Desistir da partida");
        await view.key("ArrowUp");
        expect(view.label("e4")).toContain("peão");
    });
    it("toca sons de lance, captura, xeque e roque e destaca o rei em xeque", async () => {
        const view = await localGame();
        await view.play("e2e4");
        expect(lastSound()).toContain("Move.mp3");
        await view.play("f7f6", "d1h5");
        expect(lastSound()).toContain("Check.mp3");
        expect(view.square("e8").querySelector(".bg-danger\\/50")).not.toBeNull();
        await view.play("g7g6", "h5g6");
        expect(lastSound()).toContain("Capture.mp3");
        await view.play("h7g6", "g1f3", "b8c6", "f1c4", "d7d6", "e1g1");
        expect(lastSound()).toContain("Castles.mp3");
        expect(view.label("g1")).toContain("rei");
        expect(view.label("f1")).toContain("torre");
    });
    it("desfazer durante a consulta ao histórico volta ao vivo antes de desfazer", async () => {
        const view = await localGame();
        await view.play("e2e4", "e7e5", "g1f3");
        await view.action("Ir ao início da partida");
        await view.action("Desfazer último lance");
        expect(view.label("f3")).toContain("vazia");
        expect(view.label("g1")).toContain("cavalo");
        expect(view.label("e5")).toContain("peão");
        expect(view.container.querySelectorAll("td button")).toHaveLength(2);
    });
    it("encerra por afogamento e permite reabrir o resultado", async () => {
        const view = await localGame();
        // Afogamento mais rápido conhecido (Sam Loyd): 10. Qe6 deixa as pretas sem lances.
        await view.play("e2e3", "a7a5", "d1h5", "a8a6", "h5a5", "h7h5", "h2h4", "a6h6", "a5c7", "f7f6",
            "c7d7", "e8f7", "d7b7", "d8d3", "b7b8", "d3h7", "b8c8", "f7g6", "c8e6");
        const dialog = () => view.container.querySelector("dialog[open]");
        expect(dialog()?.textContent).toContain("Empate por afogamento.");
        expect(lastSound()).toContain("Draw.mp3");
        await view.textButton("Ver tabuleiro");
        expect(dialog()).toBeNull();
        expect(view.container.textContent).toContain("Partida encerrada · Empate");
        expect(view.container.textContent).toContain("Partida local. O resultado não será salvo no perfil.");
        await view.textButton("Ver resultado");
        expect(dialog()?.textContent).toContain("Empate");
    });
    it("encerra por tripla repetição detectada pela engine", async () => {
        const view = await localGame();
        // Os cavalos vão e voltam duas vezes: a posição inicial ocorre pela 3ª vez no 8º meio-lance.
        await view.play("g1f3", "g8f6", "f3g1", "f6g8", "g1f3", "g8f6", "f3g1");
        expect(view.container.querySelector("dialog[open]")).toBeNull();
        await view.play("f6g8");
        expect(view.container.querySelector("dialog[open]")?.textContent).toContain("Empate por tripla repetição.");
        expect(lastSound()).toContain("Draw.mp3");
        expect(view.square("g1").disabled).toBe(true);
    });
    it("clicar num lance do histórico mostra a posição daquele momento", async () => {
        const view = await localGame();
        await view.play("e2e4", "e7e5", "g1f3");
        const firstMove = view.container.querySelector<HTMLButtonElement>("td button");
        await click(firstMove);
        expect(view.label("e4")).toContain("peão");
        expect(view.label("e7")).toContain("peão");
        expect(view.label("g1")).toContain("cavalo");
    });
});
