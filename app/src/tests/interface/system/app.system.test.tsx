import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import App from "../../../interface/App";
import "../../../interface/globals.css";

// Sistema do frontend: aplicação, rotas, providers, engine, IA, CSS e diálogo reais.
// O ambiente de teste desabilita somente Firebase; não representa teste do Google/Firestore.
let root: Root;
let container: HTMLDivElement;
const square = (id: string) => page.getByRole("button", { name: new RegExp(`^Casa ${id},`) });
async function move(from: string, to: string) { await square(from).click(); await square(to).click(); }
async function startLocal() {
    await page.getByRole("link", { name: "Jogar agora", exact: true }).click();
    await page.getByText("Pessoa vs. Pessoa (Local)", { exact: true }).click();
    await page.getByRole("button", { name: "Iniciar partida", exact: true }).click();
    await expect.element(square("e2")).toBeVisible();
}
const moves = () => document.querySelectorAll("td button").length;

beforeEach(async () => {
    localStorage.clear();
    window.location.hash = "/";
    await page.viewport(1280, 900);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    root.render(<App />);
    await expect.element(page.getByRole("heading", { name: /Jogo de Xadrez Web/ })).toBeVisible();
});
afterEach(async () => {
    root.unmount();
    container.remove();
});

describe("S-NAVEGADOR — jornadas completas do visitante em Chromium", () => {
    it("joga partida local com indicadores visíveis, captura, pausa, histórico e reinício", async () => {
        await startLocal();
        await square("e2").click();
        await expect.element(square("e4")).toHaveAttribute("data-move-destination", "true");
        const marker = document.querySelector('[data-squareid="e4"] [data-move-indicator="move"]')!;
        const rect = marker.getBoundingClientRect();
        expect(rect.width).toBeGreaterThan(5);
        expect(rect.height).toBeGreaterThan(5);
        expect(getComputedStyle(marker).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
        await square("e4").click();
        await move("d7", "d5"); await move("e4", "d5");
        await expect.poll(moves).toBe(3);
        await expect.element(square("d5")).toHaveAttribute("aria-label", "Casa d5, peça branca: peão");
        await page.getByRole("button", { name: "Pausar partida", exact: true }).click();
        await expect.element(square("e7")).toBeDisabled();
        await page.getByRole("button", { name: "Retomar partida", exact: true }).click();
        await page.getByRole("button", { name: "Ir ao início da partida", exact: true }).click();
        await expect.element(square("e2")).toHaveAttribute("aria-label", "Casa e2, peça branca: peão");
        await expect.element(square("e2")).toBeDisabled();
        await page.getByRole("button", { name: "Ir ao lance mais recente", exact: true }).click();
        await page.getByRole("button", { name: "Desfazer último lance", exact: true }).click();
        await expect.poll(moves).toBe(2);
        await page.getByRole("button", { name: "Desistir da partida", exact: true }).click();
        await expect.element(page.getByRole("dialog")).toBeVisible();
        await page.getByRole("button", { name: "Continuar jogando", exact: true }).click();
        await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
        await page.getByRole("button", { name: "Desistir da partida", exact: true }).click();
        await page.getByRole("button", { name: "Desistir", exact: true }).click();
        await expect.poll(() => document.querySelector("dialog[open]")?.textContent).toContain("As brancas desistiram");
        await page.getByRole("button", { name: "Jogar novamente", exact: true }).click();
        await expect.element(page.getByRole("heading", { name: "Nova partida", exact: true })).toBeVisible();
        expect(document.querySelector('[data-squareid]')).toBeNull();
    });
    it("termina uma partida por xeque-mate e mantém o tabuleiro bloqueado", async () => {
        await startLocal();
        await move("f2", "f3"); await move("e7", "e5");
        await move("g2", "g4"); await move("d8", "h4");
        await expect.poll(() => document.querySelector("dialog[open]")?.textContent).toContain("Xeque-mate. Vitória das pretas.");
        await page.getByRole("button", { name: "Ver tabuleiro", exact: true }).click();
        await expect.element(square("e2")).toBeDisabled();
        await expect.poll(moves).toBe(4);
    });
    it("joga de pretas contra a IA real, com orientação invertida", async () => {
        await page.getByRole("link", { name: "Jogar agora", exact: true }).click();
        await expect.element(page.getByRole("heading", { name: "Nova partida", exact: true })).toBeVisible();
        await page.elementLocator(document.querySelector('input[name="player-color"][value="black"]')!.closest("label")!).click();
        await page.getByRole("button", { name: "Iniciar partida", exact: true }).click();
        await expect.poll(moves, { timeout: 10000 }).toBe(1);
        expect(document.querySelector('[data-squareid]')?.getAttribute("data-squareid")).toBe("h1");
        await move("e7", "e5");
        await expect.poll(moves, { timeout: 10000 }).toBeGreaterThanOrEqual(3);
        await expect.element(square("e7")).toHaveAttribute("aria-label", "Casa e7, vazia");
    });
    it("pausa a simulação IA vs IA ao consultar o histórico", async () => {
        await page.getByRole("link", { name: "Jogar agora", exact: true }).click();
        await page.getByText("IA vs. IA", { exact: true }).click();
        await page.getByRole("button", { name: "Iniciar partida", exact: true }).click();
        await expect.poll(moves, { timeout: 10000 }).toBeGreaterThanOrEqual(2);
        await page.getByRole("button", { name: "Ir ao início da partida", exact: true }).click();
        await expect.element(page.getByText(/Partida das IAs pausada durante/)).toBeVisible();
        const pausedMoves = moves();
        // A janela precisa superar o maior atraso de abertura da IA fácil (900 ms).
        await new Promise((resolve) => setTimeout(resolve, 1200));
        expect(moves()).toBe(pausedMoves);
        await page.getByRole("button", { name: "Ir ao lance mais recente", exact: true }).click();
        await expect.poll(moves, { timeout: 10000 }).toBeGreaterThan(pausedMoves);
    });
    it("mantém navegação e tema e permite jogar quando o login está indisponível", async () => {
        const theme = page.getByRole("combobox", { name: "Selecionar paleta de cores" });
        await theme.selectOptions("classicWood");
        expect(localStorage.getItem("xadrez:theme")).toBe("classicWood");
        expect(document.documentElement.dataset.theme).toBe("classicWood");
        await page.getByRole("link", { name: "Entrar", exact: true }).click();
        await expect.element(page.getByRole("button", { name: "Entrar com Google", exact: true })).toBeDisabled();
        await page.getByRole("link", { name: "Continuar como visitante", exact: true }).click();
        await expect.element(page.getByRole("heading", { name: "Nova partida", exact: true })).toBeVisible();
        expect(document.documentElement.dataset.theme).toBe("classicWood");
    });
    it("permite configurar e mover peças em uma tela de celular sem cortar o tabuleiro", async () => {
        await page.viewport(390, 844);
        await startLocal();
        expect(document.querySelectorAll('[data-squareid]')).toHaveLength(64);
        for (const id of ["a8", "h8", "a1", "h1"]) {
            const rect = document.querySelector(`[data-squareid="${id}"]`)!.getBoundingClientRect();
            expect(rect.left).toBeGreaterThanOrEqual(0);
            expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
        }
        await move("e2", "e4");
        await expect.poll(moves).toBe(1);
        await expect.element(square("e4")).toHaveAttribute("aria-label", "Casa e4, peça branca: peão");
    });
});
