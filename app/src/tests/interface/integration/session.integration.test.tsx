// @vitest-environment jsdom
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "../../../interface/pages/Game";
import { AuthProvider } from "../../../interface/stores/AuthContext";
import { MatchHistoryProvider } from "../../../interface/stores/MatchHistoryContext";
import type { AuthService } from "../../../interface/types/auth";
import type { MatchHistoryService } from "../../../interface/types/matchHistory";
import { click, render } from "../unit/harness";

beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.stubGlobal("Audio", class { preload = ""; volume = 0; play() { return Promise.resolve(); } });
    Object.defineProperties(HTMLDialogElement.prototype, {
        showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
        close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } },
    });
});
const guest: AuthService = {
    configured: false, subscribe: () => () => {},
    signIn: async () => { throw new Error("Não usado"); }, signOut: async () => {},
};
const nextTime = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };

async function game({ ai = false, signedIn = false, failSave = false, noTime = false } = {}) {
    const save = vi.fn<MatchHistoryService["save"]>();
    if (failSave) save.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    else save.mockResolvedValue(undefined);
    const auth: AuthService = signedIn ? { ...guest, configured: true, subscribe: (onUser) => {
        onUser({ uid: "jogador-teste", displayName: "Ana", email: null, photoURL: null }); return () => {};
    } } : guest;
    const { container } = await render(<MemoryRouter><AuthProvider service={auth}>
        <MatchHistoryProvider service={{ configured: true, save, subscribe: () => () => {} }}><Game /></MatchHistoryProvider>
    </AuthProvider></MemoryRouter>);
    const square = (id: string) => container.querySelector<HTMLButtonElement>(`[data-squareid="${id}"]`)!;
    const action = (label: string) => click(container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`));
    const textButton = (text: string) => click([...container.querySelectorAll("button")].find((node) => node.textContent === text)!);
    await click(container.querySelector(`input[value="${ai ? "human-ai" : "human-human"}"]`));
    if (ai) await click(container.querySelector('input[name="player-color"][value="white"]'));
    if (noTime) await click(container.querySelector('input[value="none"]'));
    await click(container.querySelector('button[type="submit"]'));
    const move = async (from: string, to: string) => { await click(square(from)); await click(square(to)); };
    return { container, square, action, textButton, move, save };
}

describe("I-PARTIDA — componentes, hooks e engine reais", () => {
    it("conecta destino autorizado, captura, turno, relógios e histórico", async () => {
        const view = await game();
        await click(view.square("e2"));
        expect(view.square("e4").dataset.moveDestination).toBe("true");
        await click(view.square("e5"));
        expect(view.container.querySelectorAll("td button")).toHaveLength(0);
        await click(view.square("e4"));
        expect(view.square("e2").getAttribute("aria-label")).toContain("vazia");
        expect(view.container.querySelector('[role="timer"][aria-label*="Pessoa 2"]')?.getAttribute("aria-label")).toContain("relógio ativo");
        await view.move("d7", "d5");
        await view.move("e4", "d5");
        expect(view.square("d5").getAttribute("aria-label")).toContain("peça branca: peão");
        expect(view.container.querySelectorAll("td button")).toHaveLength(3);
        expect(view.container.querySelector('[aria-label="Peças capturadas"] img')).not.toBeNull();
    });
    it("pausa o relógio e bloqueia movimentos, depois retoma a seleção", async () => {
        const view = await game();
        await nextTime(1500);
        await click(view.square("e2"));
        await view.action("Pausar partida");
        const clocks = [...view.container.querySelectorAll('[role="timer"]')].map((node) => node.textContent);
        await nextTime(5000);
        expect([...view.container.querySelectorAll('[role="timer"]')].map((node) => node.textContent)).toEqual(clocks);
        expect(view.square("e4").disabled).toBe(true);
        await view.action("Retomar partida");
        expect(view.square("e2").getAttribute("aria-pressed")).toBe("true");
        await click(view.square("e4"));
        expect(view.container.querySelectorAll("td button")).toHaveLength(1);
    });
    it("apresenta e registra captura en passant sem deixar a peça capturada na tela", async () => {
        const view = await game();
        await view.move("e2", "e4"); await view.move("a7", "a6");
        await view.move("e4", "e5"); await view.move("d7", "d5");
        await click(view.square("e5"));
        expect(view.square("d6").dataset.moveDestination).toBe("true");
        await click(view.square("d6"));
        expect(view.square("d5").getAttribute("aria-label")).toContain("vazia");
        expect(view.square("d6").getAttribute("aria-label")).toContain("peça branca: peão");
        expect(view.container.querySelector('[aria-label="Peças capturadas"] img')).not.toBeNull();
        expect(view.container.querySelectorAll("td button")).toHaveLength(5);
    });
    it("navega pelo histórico e desfaz sem permitir jogar numa posição antiga", async () => {
        const view = await game();
        await view.move("e2", "e4"); await view.move("e7", "e5");
        await view.action("Ir ao início da partida");
        expect(view.square("e2").getAttribute("aria-label")).toContain("peão");
        expect(view.square("e4").disabled).toBe(true);
        await view.action("Ir ao lance mais recente");
        expect(view.square("e2").getAttribute("aria-label")).toContain("vazia");
        await view.action("Desfazer último lance");
        expect(view.square("e7").getAttribute("aria-label")).toContain("peão");
        expect(view.container.querySelectorAll("td button")).toHaveLength(1);
    });
    it("encerra por xeque-mate retornado pela engine e congela o tabuleiro", async () => {
        const view = await game();
        await view.move("f2", "f3"); await view.move("e7", "e5");
        await view.move("g2", "g4"); await view.move("d8", "h4");
        expect(view.container.querySelector("dialog[open]")?.textContent).toContain("Xeque-mate. Vitória das pretas.");
        expect(view.square("e2").disabled).toBe(true);
        expect(view.save).not.toHaveBeenCalled();
    });
    it("encerra por tempo e só apresenta o resultado uma vez", async () => {
        const view = await game();
        await nextTime(600000);
        expect(view.container.querySelectorAll("dialog[open]")).toHaveLength(1);
        expect(view.container.textContent).toContain("O tempo das brancas acabou");
        await nextTime(10000);
        expect(view.container.querySelectorAll("dialog[open]")).toHaveLength(1);
    });
    it("não cria relógios ou expiração no modo sem tempo", async () => {
        const view = await game({ noTime: true });
        expect(view.container.querySelector('[role="timer"]')).toBeNull();
        await nextTime(1200000);
        expect(view.container.querySelector("dialog[open]")).toBeNull();
        await view.move("e2", "e4");
        expect(view.square("e4").getAttribute("aria-label")).toContain("peão");
    });
    it("permite cancelar desistência e reinicia a configuração após confirmar", async () => {
        const view = await game();
        await view.action("Desistir da partida"); await view.textButton("Continuar jogando");
        expect(view.container.querySelector("dialog[open]")).toBeNull();
        await view.action("Desistir da partida"); await view.textButton("Desistir");
        expect(view.container.querySelector("dialog[open]")?.textContent).toContain("As brancas desistiram");
        await view.textButton("Jogar novamente");
        expect(view.container.querySelector("form")).not.toBeNull();
        expect(view.container.querySelector('[data-squareid]')).toBeNull();
    });
});

describe("I-IA — orquestração da IA pela interface", () => {
    it("a IA real responde e desfazer remove o par humano/IA", async () => {
        const view = await game({ ai: true });
        await view.move("e2", "e4");
        expect(view.square("e7").disabled).toBe(true);
        await nextTime(2000);
        expect(view.container.querySelectorAll("td button")).toHaveLength(2);
        expect(view.square("e2").disabled).toBe(false);
        await view.action("Desfazer último lance");
        expect(view.container.querySelectorAll("td button")).toHaveLength(0);
        expect(view.square("e2").getAttribute("aria-label")).toContain("peão");
    });
    it("pausar antes da resposta impede a IA de aplicar um lance", async () => {
        const view = await game({ ai: true });
        await view.move("e2", "e4");
        await view.action("Pausar partida");
        await nextTime(5000);
        expect(view.container.querySelectorAll("td button")).toHaveLength(1);
        await view.action("Retomar partida");
        await nextTime(2000);
        expect(view.container.querySelectorAll("td button")).toHaveLength(2);
    });
    it("salva o resultado do usuário autenticado uma vez e permite repetir após falha", async () => {
        const view = await game({ ai: true, signedIn: true, failSave: true });
        await view.action("Desistir da partida"); await view.textButton("Desistir");
        expect(view.save).toHaveBeenCalledTimes(1);
        expect(view.save).toHaveBeenCalledWith(expect.objectContaining({ ownerUid: "jogador-teste", outcome: "defeat", reasonCode: "resignation", difficulty: "easy" }));
        const retry = [...view.container.querySelectorAll("button")].find((node) => node.textContent?.includes("Tentar salvar novamente"));
        await click(retry!);
        expect(view.save).toHaveBeenCalledTimes(2);
        await view.textButton("Ver tabuleiro");
        expect(view.save).toHaveBeenCalledTimes(2);
    });
});
