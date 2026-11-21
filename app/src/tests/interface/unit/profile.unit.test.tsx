// @vitest-environment jsdom
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useMatchHistory } from "../../../interface/hooks/useMatchHistory";
import { Profile } from "../../../interface/pages/Profile";
import { AuthProvider } from "../../../interface/stores/AuthContext";
import { MatchHistoryProvider } from "../../../interface/stores/MatchHistoryContext";
import type { AuthService, AuthUser } from "../../../interface/types/auth";
import type { MatchHistoryService, MatchRecord } from "../../../interface/types/matchHistory";
import { click, render } from "./harness";

// Autenticação e histórico são fronteiras substituídas: nenhum acesso ao Firebase/Firestore.
const user: AuthUser = { uid: "u-1", displayName: "Ana Souza", email: "ana@exemplo.com", photoURL: null };
function history(configured = true) {
    const subscriptions: { uid: string; onRecords: (r: MatchRecord[]) => void; onError: (e: unknown) => void; unsubscribe: ReturnType<typeof vi.fn> }[] = [];
    const service: MatchHistoryService = {
        configured, save: vi.fn(),
        subscribe: vi.fn((uid, onRecords, onError) => {
            const unsubscribe = vi.fn();
            subscriptions.push({ uid, onRecords, onError, unsubscribe });
            return unsubscribe;
        }),
    };
    const last = () => subscriptions.at(-1)!;
    return {
        service, subscriptions,
        emit: (records: MatchRecord[]) => act(async () => last().onRecords(records)),
        fail: () => act(async () => last().onError(new Error("offline"))),
    };
}
const record = (index: number, extra: Partial<MatchRecord> = {}): MatchRecord => ({
    id: `m-${index}`, ownerUid: "u-1", endedAt: 1_700_000_000_000 + index, outcome: "victory",
    reason: `Motivo ${index}`, reasonCode: "checkmate", difficulty: "easy", opponent: `Bot ${index}`, ...extra,
});

describe("U-HIST-SALVO — hook do histórico de partidas salvas", () => {
    it("fica indisponível sem serviço configurado e carregando sem usuário", async () => {
        const off = history(false);
        let value!: ReturnType<typeof useMatchHistory>;
        function Probe({ uid }: { uid?: string }) { value = useMatchHistory(uid); return null; }
        await render(<MatchHistoryProvider service={off.service}><Probe uid="u-1" /></MatchHistoryProvider>);
        expect(value.status).toBe("unavailable");
        expect(off.service.subscribe).not.toHaveBeenCalled();

        const on = history();
        await render(<MatchHistoryProvider service={on.service}><Probe /></MatchHistoryProvider>);
        expect(value).toMatchObject({ status: "loading", records: [] });
        expect(on.service.subscribe).not.toHaveBeenCalled();
    });
    it("carrega registros, trata erro, refaz inscrição e troca de usuário", async () => {
        const h = history();
        let value!: ReturnType<typeof useMatchHistory>;
        function Probe({ uid }: { uid?: string }) { value = useMatchHistory(uid); return null; }
        const view = await render(<MatchHistoryProvider service={h.service}><Probe uid="u-1" /></MatchHistoryProvider>);
        expect(value.status).toBe("loading");
        await h.emit([record(1)]);
        expect(value).toMatchObject({ status: "ready", records: [record(1)] });
        await h.fail();
        expect(value).toMatchObject({ status: "error", records: [] });
        await act(async () => value.retry());
        expect(h.subscriptions).toHaveLength(2);
        expect(h.subscriptions[0].unsubscribe).toHaveBeenCalledTimes(1);
        await view.rerender(<MatchHistoryProvider service={h.service}><Probe uid="u-2" /></MatchHistoryProvider>);
        expect(h.subscriptions.at(-1)!.uid).toBe("u-2");
        expect(value.records).toEqual([]);
        // Respostas atrasadas de inscrições canceladas são ignoradas.
        await act(async () => { h.subscriptions[1].onRecords([record(9)]); h.subscriptions[1].onError(new Error("x")); });
        expect(value.status).toBe("loading");
    });
});

function renderProfile(auth: AuthService, service: MatchHistoryService) {
    return render(<MemoryRouter><AuthProvider service={auth}><MatchHistoryProvider service={service}>
        <Profile />
    </MatchHistoryProvider></AuthProvider></MemoryRouter>);
}
function authWith(current: AuthUser | null, extra: Partial<AuthService> = {}): AuthService {
    return { configured: true, subscribe: (onUser) => { onUser(current); return () => {}; },
        signIn: async () => ({ user, isNewUser: false }), signOut: vi.fn(async () => {}), ...extra };
}
const text = (root: HTMLElement, selector: string) => root.querySelector(selector)?.textContent;
const buttonByText = (root: HTMLElement, label: string) =>
    [...root.querySelectorAll("button")].find((node) => node.textContent === label) ?? null;
async function choose(select: HTMLSelectElement, value: string) {
    await act(async () => {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
    });
}

describe("U-PERFIL — página de perfil", () => {
    it("mostra carregamento enquanto a sessão é verificada", async () => {
        const { container } = await renderProfile({ ...authWith(null), subscribe: () => () => {} }, history().service);
        expect(text(container, '[role="status"]')).toBe("Carregando seu perfil…");
    });
    it("convida visitante a entrar", async () => {
        const { container } = await renderProfile(authWith(null), history().service);
        const links = [...container.querySelectorAll("a")].map((link) => link.getAttribute("href"));
        expect(links).toEqual(["/login", "/game"]);
    });
    it("exibe dados da conta, estatísticas e histórico vazio", async () => {
        const h = history();
        const { container } = await renderProfile(authWith(user), h.service);
        expect(text(container, "h1")).toBe("Ana Souza");
        expect(container.textContent).toContain("ana@exemplo.com");
        expect(text(container, '[role="status"]')).toBe("Carregando suas partidas…");
        expect(container.querySelector("select")?.disabled).toBe(true);
        expect(container.textContent).toContain("—");
        await h.emit([]);
        expect(container.textContent).toContain("Você ainda não tem partidas salvas");
        expect(container.textContent).toContain("0%");
    });
    it("calcula estatísticas, filtra e pagina o histórico", async () => {
        const h = history();
        const records = Array.from({ length: 12 }, (_, index) => record(index, index < 2
            ? { outcome: "defeat", difficulty: "hard" } : index === 2 ? { outcome: "draw", difficulty: "medium" } : {}));
        const { container } = await renderProfile(authWith(user), h.service);
        await h.emit(records);
        const stats = [...container.querySelectorAll('[aria-label="Estatísticas das partidas salvas"] > div')]
            .map((node) => node.lastElementChild?.textContent);
        expect(stats).toEqual(["12", "9", "2", "1", "75%"]);
        const items = () => container.querySelectorAll('[aria-label="Partidas salvas"] li');
        expect(items()).toHaveLength(10);
        expect(container.textContent).toContain("Página 1 de 2 · 12 partidas");
        expect(buttonByText(container, "Anterior")?.disabled).toBe(true);
        await click(buttonByText(container, "Próxima"));
        expect(items()).toHaveLength(2);
        expect(container.textContent).toContain("Página 2 de 2");
        await click(buttonByText(container, "Anterior"));
        expect(container.textContent).toContain("Página 1 de 2");

        const [outcome, difficulty] = container.querySelectorAll("select");
        await choose(outcome, "defeat");
        expect(items()).toHaveLength(2);
        expect(items()[0].textContent).toContain("Derrota");
        expect(items()[0].textContent).toContain("Difícil");
        await choose(difficulty, "easy");
        expect(text(container, '[role="status"]')).toBe("Nenhuma partida corresponde aos filtros selecionados.");
        await choose(outcome, "all");
        await choose(difficulty, "medium");
        expect(items()).toHaveLength(1);
        expect(items()[0].textContent).toContain("Empate");
        expect(items()[0].querySelector("time")?.getAttribute("dateTime")).toBe(new Date(records[2].endedAt).toISOString());
    });
    it("oferece nova tentativa quando o histórico falha", async () => {
        const h = history();
        const { container } = await renderProfile(authWith(user), h.service);
        await h.fail();
        expect(text(container, '[role="alert"]')).toContain("Não foi possível carregar seu histórico");
        await click(buttonByText(container, "Tentar novamente"));
        expect(h.service.subscribe).toHaveBeenCalledTimes(2);
    });
    it("informa histórico indisponível e permite sair", async () => {
        let finish!: () => void;
        const signOut = vi.fn(() => new Promise<void>((done) => { finish = done; }));
        const { container } = await renderProfile(authWith({ ...user, email: null }, { signOut }), history(false).service);
        expect(container.textContent).toContain("O histórico ainda não está disponível");
        expect(container.textContent).not.toContain("ana@exemplo.com");
        await click(buttonByText(container, "Sair da conta"));
        expect(buttonByText(container, "Saindo…")?.disabled).toBe(true);
        await act(async () => finish());
        expect(container.querySelector('a[href="/login"]')).not.toBeNull();
    });
    it("mostra erro de saída da conta", async () => {
        const signOut = vi.fn(async () => { throw new Error("offline"); });
        const { container } = await renderProfile(authWith(user, { signOut }), history(false).service);
        await click(buttonByText(container, "Sair da conta"));
        expect(text(container, '[role="alert"]')).toContain("Não foi possível sair");
    });
});
