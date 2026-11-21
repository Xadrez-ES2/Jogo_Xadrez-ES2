// @vitest-environment jsdom
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLegalMoves, type GameState, type Move } from "../../../engine";
import { toEngineSquare } from "../../../interface/hooks/useGameMoves";
import { Game } from "../../../interface/pages/Game";
import { AuthProvider } from "../../../interface/stores/AuthContext";
import { MatchHistoryProvider } from "../../../interface/stores/MatchHistoryContext";
import type { AuthService, AuthUser } from "../../../interface/types/auth";
import type { GameSetup } from "../../../interface/types/gameSetup";
import type { MatchHistoryService } from "../../../interface/types/matchHistory";
import type { SquareId } from "../../../interface/types/square";
import { click, render } from "./harness";

/*
    Teste de unidade da página de partida. Fronteiras substituídas:
    - Board: componente testado à parte; aqui só capturamos as props que a página entrega.
    - GameSetupForm: testado à parte; aqui injeta a configuração desejada.
    - IA (chooseMove): roteirizada pelo teste.
    - getGameStatus: pode ser forçado para estados difíceis de alcançar pelo tabuleiro.
    As regras de movimento da engine permanecem reais (dados puros, sem rede).
*/
const h = vi.hoisted(() => ({
    board: { props: {} as Record<string, any> },
    setup: { value: null as unknown as GameSetup },
    status: { value: null as string | null },
    chooseMove: vi.fn(),
}));
vi.mock("../../../interface/components/Board_Components/Board", () => ({
    Board: (props: Record<string, unknown>) => { h.board.props = props; return <div data-testid="board" />; },
}));
vi.mock("../../../interface/components/GameSetupForm", () => ({
    GameSetupForm: ({ onStart }: { onStart: (setup: GameSetup) => void }) =>
        <button type="button" data-start onClick={() => onStart(h.setup.value)}>Iniciar</button>,
}));
vi.mock("../../../ai", () => ({ chooseMove: h.chooseMove }));
vi.mock("../../../engine", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../engine")>();
    return { ...actual, getGameStatus: (game: GameState) => (h.status.value ?? actual.getGameStatus(game)) as never };
});

const sounds: string[] = [];
beforeEach(() => {
    vi.useFakeTimers();
    sounds.length = 0;
    h.status.value = null;
    h.chooseMove.mockReset();
    h.chooseMove.mockImplementation((game: GameState) => getLegalMoves(game)[0] ?? null);
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.stubGlobal("Audio", class {
        preload = ""; volume = 0; src: string;
        constructor(src: string) { this.src = src; }
        play() { sounds.push(this.src); return Promise.resolve(); }
    });
    Object.defineProperties(HTMLDialogElement.prototype, {
        showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
        close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } },
    });
});

const ana: AuthUser = { uid: "u-1", displayName: "Ana", email: null, photoURL: "https://exemplo.com/ana.png" };
function authFor(user: AuthUser | null) {
    let emit: (user: AuthUser | null) => void = () => {};
    const service: AuthService = {
        configured: user !== null,
        subscribe: (onUser) => { emit = onUser; onUser(user); return () => {}; },
        signIn: vi.fn(), signOut: vi.fn(),
    };
    return { service, emit: (next: AuthUser | null) => act(async () => emit(next)) };
}
const wait = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

async function start(setup: Partial<GameSetup>, { user = null as AuthUser | null, save = vi.fn<MatchHistoryService["save"]>().mockResolvedValue() } = {}) {
    h.setup.value = { mode: "human-human", difficulty: "easy", timeLimitMs: null, ...setup };
    const auth = authFor(user);
    const view = await render(<MemoryRouter><AuthProvider service={auth.service}>
        <MatchHistoryProvider service={{ configured: true, save, subscribe: () => () => {} }}><Game /></MatchHistoryProvider>
    </AuthProvider></MemoryRouter>);
    await click(view.container.querySelector("[data-start]"));
    const { container } = view;
    const select = (square: SquareId) => act(async () => h.board.props.onSquareSelect(square));
    const play = async (...moves: string[]) => {
        for (const move of moves) { await select(move.slice(0, 2) as SquareId); await select(move.slice(2, 4) as SquareId); }
    };
    const byLabel = (name: string) => container.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);
    const byText = (text: string) => [...container.querySelectorAll("button")].find((node) => node.textContent === text) ?? null;
    const key = (name: string, target: EventTarget = window) =>
        act(async () => { target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true })); });
    const dialog = () => container.querySelector("dialog[open]");
    const moves = () => container.querySelectorAll("td button").length;
    return { container, select, play, byLabel, byText, key, dialog, moves, save, auth };
}
const resign = async (view: Awaited<ReturnType<typeof start>>) => {
    await click(view.byLabel("Desistir da partida"));
    await click(view.byText("Desistir"));
};
function script(...moves: string[]) {
    const queue: Move[] = moves.map((m) => ({ from: toEngineSquare(m.slice(0, 2) as SquareId), to: toEngineSquare(m.slice(2, 4) as SquareId) }));
    h.chooseMove.mockImplementation(() => queue.shift() ?? null);
}

describe("U-JOGO-CONF — montagem da sessão conforme a configuração", () => {
    it("jogador de pretas autenticado contra IA, com tempo padrão", async () => {
        const view = await start({ mode: "human-ai", difficulty: "medium", playerColor: "black", timeLimitMs: undefined }, { user: ana });
        expect(h.board.props.orientation).toBe("black");
        expect(h.board.props.bottomPlayer).toMatchObject({ name: "Ana", avatarUrl: ana.photoURL, color: "black" });
        expect(h.board.props.topPlayer).toMatchObject({ name: "Bot", color: "white" });
        expect(view.container.textContent).toContain("Pessoa vs. IA · Dificuldade: Médio · 10 min");
        expect(h.board.props.disabled).toBe(true);
        expect(view.container.textContent).toContain("A IA está pensando.");
        await wait(2000);
        expect(view.moves()).toBe(1);
        expect(h.board.props.disabled).toBe(false);
        expect(view.container.textContent).toContain("Selecione uma peça preta e depois um destino destacado.");
        expect(view.container.textContent).not.toContain("A IA está pensando.");
    });
    it("usuário sem foto recebe avatar vazio", async () => {
        await start({ mode: "human-ai", playerColor: "white" }, { user: { ...ana, photoURL: null } });
        expect(h.board.props.bottomPlayer.avatarUrl).toBe("");
    });
    it("IA vs IA não oferece pausa nem desistência e promove automaticamente para dama", async () => {
        script("h2h4", "g7g5", "h4g5", "h7h6", "g5h6", "f8g7", "h6g7", "g8f6", "g7h8");
        const view = await start({ mode: "ai-ai", timeLimitMs: 300_000 });
        expect(h.board.props.bottomPlayer).toMatchObject({ name: "IA (brancas)", color: "white" });
        expect(h.board.props.topPlayer.name).toBe("IA (pretas)");
        expect(view.byLabel("Pausar partida")).toBeNull();
        expect(view.byLabel("Desistir da partida")).toBeNull();
        expect(view.container.textContent).toContain("IA vs. IA · Dificuldade: Fácil · 5 min");
        for (let i = 0; i < 12; i++) await wait(1500);
        expect(view.moves()).toBe(9);
        expect(view.container.textContent).toContain("gxh8=♕");
        expect(h.board.props.bottomCapturedPieces).toContain("rook");
        expect(h.board.props.topCapturedPieces).toEqual([]);
    });
});

describe("U-JOGO-FIM — encerramentos", () => {
    it.each([
        ["fifty-moves", "Empate pela regra dos 50 lances."],
        ["stalemate", "Empate por afogamento."],
        ["insufficient-material", "Empate por falta de peças."],
        ["threefold-repetition", "Empate por tripla repetição."],
    ])("encerra por %s", async (status, reason) => {
        const view = await start({});
        await view.play("e2e4");
        h.status.value = status;
        await view.play("e7e5");
        expect(view.dialog()?.textContent).toContain(reason);
        expect(sounds.at(-1)).toContain("Draw.mp3");
        expect(view.dialog()?.textContent).toContain("Partida local. O resultado não será salvo no perfil.");
    });
    it("tripla repetição contra a IA encerra, salva empate e impede a IA de jogar", async () => {
        const view = await start({ mode: "human-ai", playerColor: "white" }, { user: ana });
        h.status.value = "threefold-repetition";
        await view.play("e2e4");
        await wait(5000);
        expect(view.moves()).toBe(1);
        expect(h.chooseMove).not.toHaveBeenCalled();
        expect(view.dialog()?.textContent).toContain("Empate por tripla repetição.");
        expect(view.save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ outcome: "draw", reasonCode: "draw" }));
    });
    it("vitória por xeque-mate salva para o usuário e não encerra duas vezes", async () => {
        const view = await start({ mode: "human-ai", playerColor: "white", difficulty: "hard" }, { user: ana });
        h.status.value = "checkmate";
        await view.play("e2e4");
        expect(view.dialog()?.textContent).toContain("Xeque-mate. Vitória das brancas.");
        expect(view.dialog()?.textContent).toContain("Vitória");
        expect(view.save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
            ownerUid: "u-1", outcome: "victory", reasonCode: "checkmate", difficulty: "hard", opponent: "Bot" }));
        await view.auth.emit({ ...ana, displayName: "Ana Maria" });
        expect(view.save).toHaveBeenCalledTimes(1);
        expect(view.container.querySelectorAll("dialog[open]")).toHaveLength(1);
    });
    it("derrota por xeque-mate quando a IA vence", async () => {
        const view = await start({ mode: "human-ai", playerColor: "black" });
        h.status.value = "checkmate";
        await wait(2000);
        expect(view.dialog()?.textContent).toContain("Derrota");
        expect(view.dialog()?.textContent).toContain("Partidas de visitantes não são salvas.");
    });
    it.each([
        [{ mode: "human-ai", playerColor: "white" }, "Seu tempo acabou. Vitória do Bot.", "Derrota"],
        [{ mode: "human-ai", playerColor: "black" }, "O tempo do Bot acabou. Você venceu.", "Vitória"],
        [{ mode: "ai-ai" }, "O tempo da IA das brancas acabou. Vitória da IA das pretas.", "Derrota"],
    ] as const)("encerra por tempo em %o", async (setup, reason, title) => {
        h.chooseMove.mockReturnValue(null);
        const view = await start({ ...setup, timeLimitMs: 60_000 });
        await wait(61_000);
        expect(view.dialog()?.textContent).toContain(reason);
        expect(view.dialog()?.textContent).toContain(title);
    });
    it("encerra por tempo das pretas na partida local", async () => {
        const view = await start({ timeLimitMs: 60_000 });
        await view.play("e2e4");
        await wait(61_000);
        expect(view.dialog()?.textContent).toContain("O tempo das pretas acabou. Vitória das brancas.");
    });
    it("desistência das pretas na partida local e reabertura do resultado", async () => {
        const view = await start({});
        await view.play("e2e4");
        await click(view.byLabel("Desistir da partida"));
        expect(view.dialog()?.textContent).toContain("Ao confirmar, as pretas desistem e as brancas vencem.");
        await click(view.byText("Desistir"));
        expect(view.dialog()?.textContent).toContain("As pretas desistiram. Vitória das brancas.");
        expect(view.dialog()?.textContent).toContain("Vitória");
        await click(view.byText("Ver tabuleiro"));
        expect(view.container.textContent).toContain("Partida encerrada · Vitória");
        await click(view.byText("Ver resultado"));
        expect(view.dialog()).not.toBeNull();
        await click(view.byText("Ver tabuleiro"));
        await click(view.byText("Nova partida"));
        expect(view.container.querySelector("[data-start]")).not.toBeNull();
    });
    it("desistência contra a IA mostra aviso de derrota e estado do salvamento", async () => {
        let finish!: () => void;
        const save = vi.fn<MatchHistoryService["save"]>(() => new Promise<void>((done) => { finish = done; }));
        const view = await start({ mode: "human-ai", playerColor: "white" }, { user: ana, save });
        await click(view.byLabel("Desistir da partida"));
        expect(view.dialog()?.textContent).toContain("Ao desistir, você perde a partida.");
        await click(view.byText("Desistir"));
        expect(view.dialog()?.textContent).toContain("Você desistiu da partida. Vitória do Bot.");
        expect(view.dialog()?.textContent).toContain("Salvando partida…");
        expect(view.byText("Jogar novamente")?.disabled).toBe(true);
        await act(async () => finish());
        expect(view.dialog()?.textContent).toContain("Partida salva no seu histórico.");
        await click(view.byText("Jogar novamente"));
        expect(view.container.querySelector("[data-start]")).not.toBeNull();
    });
    it("xeque-mate das pretas na partida local é derrota do jogador das brancas", async () => {
        const view = await start({});
        await view.play("e2e4");
        h.status.value = "checkmate";
        await view.play("e7e5");
        expect(view.dialog()?.textContent).toContain("Xeque-mate. Vitória das pretas.");
        expect(view.dialog()?.textContent).toContain("Derrota");
    });
    it("cancela a desistência pelo botão e pela tecla Esc", async () => {
        const view = await start({});
        await click(view.byLabel("Desistir da partida"));
        expect(view.dialog()?.textContent).toContain("Ao confirmar, as brancas desistem e as pretas vencem.");
        await click(view.byText("Continuar jogando"));
        expect(view.dialog()).toBeNull();
        await click(view.byLabel("Desistir da partida"));
        await act(async () => { view.dialog()!.dispatchEvent(new Event("cancel", { cancelable: true })); });
        expect(view.dialog()).toBeNull();
        expect(view.container.textContent).not.toContain("Partida encerrada");
    });
    it("reinicia antes do fim pelo botão de configuração", async () => {
        const view = await start({});
        await click(view.byText("Configurar nova partida"));
        expect(view.container.querySelector("[data-start]")).not.toBeNull();
    });
});

describe("U-JOGO-INTERACAO — teclado, desfazer, sons e bloqueios", () => {
    it("navega pelo teclado e ignora campos editáveis, outras teclas e modais", async () => {
        const view = await start({});
        await view.key("ArrowLeft");
        expect(view.byText("Voltar ao lance atual")).toBeNull();
        await view.play("e2e4", "e7e5");
        const textarea = document.createElement("textarea");
        const select = document.createElement("select");
        const editable = document.createElement("div");
        Object.defineProperty(editable, "isContentEditable", { value: true });
        document.body.append(textarea, select, editable);
        for (const target of [textarea, select, editable]) await view.key("ArrowUp", target);
        await view.key("Escape");
        expect(view.container.textContent).not.toContain("Voltar ao lance atual");
        await view.key("ArrowUp");
        expect(h.board.props.pieces.e2).toBeDefined();
        await view.key("ArrowRight");
        expect(h.board.props.pieces.e4).toBeDefined();
        expect(h.board.props.pieces.e5).toBeUndefined();
        await view.key("ArrowDown");
        expect(h.board.props.pieces.e5).toBeDefined();
        await view.key("ArrowLeft");
        expect(h.board.props.pieces.e5).toBeUndefined();
        await view.key("ArrowDown");
        await click(view.byLabel("Desistir da partida"));
        await view.key("ArrowUp");
        expect(h.board.props.pieces.e5).toBeDefined();
        await click(view.byText("Desistir"));
        await view.key("ArrowUp");
        expect(h.board.props.pieces.e5).toBeDefined();
    });
    it("desfaz um meio-lance antes da resposta da IA e dois depois dela", async () => {
        const view = await start({ mode: "human-ai", playerColor: "white" });
        expect(view.byLabel("Desfazer último lance")?.disabled ?? true).toBe(true);
        await view.play("e2e4");
        await click(view.byLabel("Desfazer último lance"));
        expect(view.moves()).toBe(0);
        await view.play("d2d4");
        await wait(2000);
        expect(view.moves()).toBe(2);
        await click(view.byLabel("Desfazer último lance"));
        expect(view.moves()).toBe(0);
        expect(h.board.props.pieces.d2).toBeDefined();
    });
    it("desfazer na partida local volta ao vivo e remove um meio-lance", async () => {
        const view = await start({});
        await view.play("e2e4", "e7e5");
        await click(view.byLabel("Ir ao início da partida"));
        await click(view.byLabel("Desfazer último lance"));
        expect(view.container.textContent).not.toContain("Voltar ao lance atual");
        expect(view.moves()).toBe(1);
        expect(h.board.props.pieces.e7).toBeDefined();
        expect(h.board.props.pieces.e4).toBeDefined();
    });
    it("volta ao lance atual quando a IA joga durante a consulta ao histórico", async () => {
        const view = await start({ mode: "human-ai", playerColor: "white" });
        await view.play("e2e4");
        await click(view.byLabel("Ir ao início da partida"));
        expect(view.container.textContent).toContain("Voltar ao lance atual");
        expect(h.board.props.legalMoves).toEqual([]);
        await wait(2000);
        expect(view.moves()).toBe(2);
        expect(view.container.textContent).not.toContain("Voltar ao lance atual");
    });
    it("toca sons de captura e roque e marca o rei em xeque só ao vivo", async () => {
        const view = await start({});
        await view.play("e2e4", "d7d5", "e4d5");
        expect(sounds.at(-1)).toContain("Capture.mp3");
        await view.play("g8f6", "g1f3", "e7e6", "f1e2", "f8e7", "e1g1");
        expect(sounds.at(-1)).toContain("Castles.mp3");
        h.status.value = "check";
        await view.play("e8g8");
        expect(sounds.at(-1)).toContain("Castles.mp3");
        await view.play("d2d3");
        expect(sounds.at(-1)).toContain("Check.mp3");
        expect(h.board.props.checkSquare).toBe("g8");
        await click(view.byLabel("Lance anterior"));
        expect(h.board.props.checkSquare).toBeUndefined();
    });
    it("mostra na barra do adversário as peças que ele capturou", async () => {
        const view = await start({});
        await view.play("e2e4", "d7d5", "a2a3", "d5e4");
        expect(h.board.props.topCapturedPieces).toEqual(["pawn"]);
        expect(h.board.props.bottomCapturedPieces).toEqual([]);
    });
    it("bloqueia cliques no tabuleiro quando pausado, consultando histórico, na vez da IA ou encerrado", async () => {
        const view = await start({ mode: "human-ai", playerColor: "black" });
        await view.select("e2");
        expect(h.board.props.selectedSquare).toBeUndefined();
        await wait(2000);
        await view.select("e7");
        expect(h.board.props.selectedSquare).toBe("e7");
        await view.select("e7");
        await click(view.byLabel("Pausar partida"));
        expect(view.container.textContent).toContain("Partida pausada");
        await view.select("e7");
        expect(h.board.props.selectedSquare).toBeUndefined();
        await click(view.byLabel("Retomar partida"));
        await click(view.byLabel("Ir ao início da partida"));
        await view.select("e7");
        expect(h.board.props.selectedSquare).toBeUndefined();
        await click(view.byLabel("Ir ao lance mais recente"));
        await resign(view);
        await view.select("e7");
        expect(h.board.props.selectedSquare).toBeUndefined();
    });
    it("aguarda a escolha de promoção do jogador com o tabuleiro bloqueado", async () => {
        const view = await start({});
        await view.play("h2h4", "g7g5", "h4g5", "h7h6", "g5h6", "f8g7", "h6g7", "g8f6", "g7h8");
        expect(h.board.props.promotionSquare).toBe("h8");
        expect(h.board.props.disabled).toBe(true);
        await act(async () => h.board.props.onPromotionSelect("n"));
        expect(h.board.props.promotionSquare).toBeUndefined();
        expect(view.container.textContent).toContain("gxh8=♘");
    });
    it("seleciona destino clicando num lance do painel e encerra a animação", async () => {
        const view = await start({});
        await view.play("e2e4", "e7e5");
        expect(h.board.props.animatingMove).toBeDefined();
        await act(async () => h.board.props.onAnimationEnd());
        expect(h.board.props.animatingMove).toBeUndefined();
        await click(view.container.querySelector<HTMLButtonElement>("td button"));
        expect(h.board.props.lastMove).toMatchObject({ to: "e4" });
        expect(h.board.props.animatingMove).toBeUndefined();
    });
});
