// @vitest-environment jsdom
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { AnimatedPieceLayer, type PieceAnimation } from "../../../interface/components/Board_Components/AnimatedPieceLayer";
import { Board } from "../../../interface/components/Board_Components/Board";
import { label, MoveHistoryPanel } from "../../../interface/components/Board_Components/MoveHistoryPanel";
import { PlayerBar } from "../../../interface/components/Board_Components/PlayerBar";
import { Square } from "../../../interface/components/Board_Components/Square";
import { StatusPanel } from "../../../interface/components/Board_Components/StatusPanel";
import type { PlayedMove } from "../../../interface/hooks/useGameMoves";
import type { Player } from "../../../interface/types/player";
import type { BoardState } from "../../../interface/types/square";
import { click, render } from "./harness";

const white: Player = { id: "w", name: "Ana Souza", avatarUrl: "", color: "white", isBot: false };
const black: Player = { id: "b", name: "Bot", avatarUrl: "https://exemplo.com/bot.png", color: "black", isBot: true };
const squareOrder = (root: HTMLElement) => [...root.querySelectorAll<HTMLButtonElement>("[data-squareid]")].map((node) => node.dataset.squareid);

describe("U-TABULEIRO — montagem do tabuleiro", () => {
    it("desenha na orientação das brancas sem jogadores definidos", async () => {
        const { container } = await render(<Board />);
        const order = squareOrder(container);
        expect(order).toHaveLength(64);
        expect(order[0]).toBe("a8");
        expect(order[63]).toBe("h1");
        expect(container.textContent).toContain("Jogador não definido");
    });
    it("inverte casas e réguas na orientação das pretas e liga relógios aos jogadores", async () => {
        const { container } = await render(<Board orientation="black" topPlayer={white} bottomPlayer={black}
            clockTimes={{ white: 60_000, black: 30_000 }} activeClock="black" checkSquare="e8" highlightedSquares={["d4"]} />);
        const order = squareOrder(container);
        expect(order[0]).toBe("h1");
        expect(order[63]).toBe("a8");
        const timers = [...container.querySelectorAll('[role="timer"]')];
        expect(timers.map((timer) => timer.textContent)).toEqual(["01:00", "00:30"]);
        expect(timers[1].getAttribute("aria-label")).toContain("relógio ativo");
        expect(container.querySelector('[data-squareid="e8"] .bg-danger\\/50')).not.toBeNull();
    });
    it("usa um fim de animação vazio quando nenhum callback é informado", async () => {
        vi.useFakeTimers();
        const animation = { id: "x", from: "e2", to: "e4", piece: { piece: { type: "pawn" }, color: "white" } } as const;
        const { container } = await render(<Board animatingMove={animation}
            pieces={{ e4: { piece: { type: "pawn" }, color: "white" } }} />);
        expect(container.querySelector('[data-squareid="e4"] img')).toBeNull();
        await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    });
    it.each([
        ["a8", "branca", { a8: { piece: { type: "pawn" }, color: "white" } }, "12.5%", "0%", "flex-col"],
        ["h8", "branca (sem peça)", {}, "75%", "0%", "flex-col"],
        ["a1", "preta (sem peça)", {}, "12.5%", "50%", "flex-col-reverse"],
        ["g1", "preta", { g1: { piece: { type: "pawn" }, color: "black" } }, "62.5%", "50%", "flex-col-reverse"],
    ] as [string, string, BoardState, string, string, string][])(
        "posiciona o seletor de promoção em %s para peça %s", async (square, _color, pieces, left, top, direction) => {
            const onPromotionSelect = vi.fn();
            const { container } = await render(<Board pieces={pieces} promotionSquare={square as never} onPromotionSelect={onPromotionSelect} />);
            const group = container.querySelector<HTMLElement>('[aria-label="Escolha a peça para promoção"]')!;
            expect(group.style.left).toBe(left);
            expect(group.style.top).toBe(top);
            expect(group.className).toContain(direction);
            const expected = square.endsWith("8") ? "white" : "black";
            expect(group.querySelector("img")?.getAttribute("src")).toContain(`${expected}-queen`);
            for (const name of ["dama", "torre", "bispo", "cavalo"]) {
                await click(group.querySelector<HTMLButtonElement>(`button[aria-label="Promover para ${name}"]`));
            }
            expect(onPromotionSelect.mock.calls.map(([piece]) => piece)).toEqual(["q", "r", "b", "n"]);
        });
    it("não exibe o seletor de promoção sem callback", async () => {
        const { container } = await render(<Board promotionSquare="a8" />);
        expect(container.querySelector('[aria-label="Escolha a peça para promoção"]')).toBeNull();
    });
});

describe("U-ANIM — peça em movimento", () => {
    const animation = (id = "a1", from = "e2", to = "e4"): PieceAnimation =>
        ({ id, from, to, piece: { piece: { type: "pawn" }, color: "white" } }) as PieceAnimation;
    function stubAnimate() {
        const instances: { keyframes: Keyframe[]; cancel: ReturnType<typeof vi.fn>; onfinish: (() => void) | null }[] = [];
        const animate = vi.fn(function (keyframes: Keyframe[]) {
            const instance = { keyframes, cancel: vi.fn(), onfinish: null as (() => void) | null };
            instances.push(instance);
            return instance;
        });
        Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, writable: true, value: animate });
        return { animate, instances, restore: () => { delete (HTMLElement.prototype as Partial<HTMLElement>).animate; } };
    }

    it("sem Web Animations API conclui imediatamente", async () => {
        const onEnd = vi.fn();
        const { container } = await render(<AnimatedPieceLayer animation={animation()} onAnimationEnd={onEnd} />);
        expect(onEnd).toHaveBeenCalledTimes(1);
        const layer = container.firstElementChild as HTMLElement;
        expect(layer.style.left).toBe("50%");
        expect(layer.style.top).toBe("50%");
    });
    it("anima da origem ao destino uma única vez e conclui ao terminar", async () => {
        const api = stubAnimate();
        try {
            const onEnd = vi.fn();
            const view = await render(<AnimatedPieceLayer animation={animation()} onAnimationEnd={onEnd} />);
            expect(api.instances[0].keyframes[0]).toEqual({ transform: "translate3d(0%, 200%, 0)" });
            await view.rerender(<AnimatedPieceLayer animation={animation()} onAnimationEnd={onEnd} />);
            expect(api.animate).toHaveBeenCalledTimes(1);
            act(() => api.instances[0].onfinish!());
            act(() => api.instances[0].onfinish!());
            expect(onEnd).toHaveBeenCalledTimes(1);
        } finally { api.restore(); }
    });
    it("usa o temporizador de segurança e inverte o deslocamento para as pretas", async () => {
        vi.useFakeTimers();
        const api = stubAnimate();
        try {
            const onEnd = vi.fn();
            const { container } = await render(<AnimatedPieceLayer animation={animation("b", "b1", "c3")} orientation="black" onAnimationEnd={onEnd} />);
            expect(api.instances[0].keyframes[0]).toEqual({ transform: "translate3d(100%, -200%, 0)" });
            expect((container.firstElementChild as HTMLElement).style.left).toBe("62.5%");
            await act(async () => { await vi.advanceTimersByTimeAsync(250); });
            expect(onEnd).toHaveBeenCalledTimes(1);
        } finally { api.restore(); }
    });
    it("não reinicia o mesmo lance quando só a orientação muda", async () => {
        const api = stubAnimate();
        try {
            const view = await render(<AnimatedPieceLayer animation={animation()} onAnimationEnd={vi.fn()} />);
            await view.rerender(<AnimatedPieceLayer animation={animation()} orientation="black" onAnimationEnd={vi.fn()} />);
            expect(api.animate).toHaveBeenCalledTimes(1);
            expect((view.container.firstElementChild as HTMLElement).style.top).toBe("37.5%");
        } finally { api.restore(); }
    });
    it("cancela a animação em curso quando o lance deixa de existir", async () => {
        const api = stubAnimate();
        try {
            const onEnd = vi.fn();
            const view = await render(<AnimatedPieceLayer animation={animation()} onAnimationEnd={onEnd} />);
            await view.rerender(<AnimatedPieceLayer animation={undefined} onAnimationEnd={onEnd} />);
            expect(api.instances[0].cancel).toHaveBeenCalledTimes(1);
            expect(view.container.innerHTML).toBe("");
            await view.rerender(<AnimatedPieceLayer animation={undefined} onAnimationEnd={onEnd} />);
            expect(onEnd).not.toHaveBeenCalled();
        } finally { api.restore(); }
    });
});

describe("U-JOGADOR — barra do jogador", () => {
    it("indica jogador ausente", async () => {
        const { container } = await render(<PlayerBar />);
        expect(container.textContent).toBe("Jogador não definido");
    });
    it("mostra avatar, peças brancas capturadas pelas pretas e relógio", async () => {
        const { container } = await render(<PlayerBar player={black} capturedPieces={["pawn"]} remainingMs={5_000} clockActive />);
        expect(container.querySelector("img")?.getAttribute("alt")).toBe("Avatar de Bot");
        expect(container.querySelector('[aria-label="Peças capturadas"] img')?.getAttribute("src")).toContain("white-pawn");
    });
    it("usa as iniciais e peças pretas para o jogador das brancas", async () => {
        const { container } = await render(<PlayerBar player={white} capturedPieces={["knight"]} />);
        expect(container.textContent).toContain("AS");
        expect(container.querySelector('[aria-label="Peças capturadas"] img')?.getAttribute("src")).toContain("black-knight");
    });
});

describe("U-STATUS — painel de status", () => {
    it.each([
        ["human-human", "white", "white", "Vez das brancas", "Partida local"],
        ["ai-ai", "black", "white", "Vez das pretas", "As IAs estão jogando."],
        ["human-ai", "white", "white", "Vez das brancas", "Selecione uma peça branca e depois um destino destacado."],
        ["human-ai", "black", "white", "Vez das pretas", "A IA está pensando."],
        ["human-ai", "black", "black", "Vez das pretas", "Selecione uma peça preta e depois um destino destacado."],
        ["human-ai", "white", "black", "Vez das brancas", "A IA está pensando."],
    ] as const)("modo %s, vez das %s, jogador de %s", async (mode, color, playerColor, turn, message) => {
        const { container } = await render(<StatusPanel mode={mode} activeColor={color} playerColor={playerColor} />);
        expect(container.textContent).toContain(turn);
        expect(container.textContent).toContain(message);
    });
    it("considera o jogador de brancas quando a cor não é informada", async () => {
        const { container } = await render(<StatusPanel mode="human-ai" activeColor="black" />);
        expect(container.textContent).toContain("A IA está pensando.");
    });
});

describe("U-CASA-VIS — destaques visuais da casa", () => {
    it.each([[true, "bg-danger/50"], [false, "bg-danger"]] as const)("anotação em casa clara=%s", async (isLight, cls) => {
        const { container } = await render(<Square id="d4" isLight={isLight} isAnnotated isCheck />);
        const marks = [...container.querySelectorAll('[aria-hidden="true"]')].map((node) => node.className);
        expect(marks.some((name) => name.includes("bg-danger/50") && name.includes("inset-0"))).toBe(true);
        expect(marks.some((name) => name.split(" ").includes(cls))).toBe(true);
    });
});

describe("U-PAINEL — notação e navegação do histórico", () => {
    const move = (extra: Partial<PlayedMove>): PlayedMove =>
        ({ from: "e2", to: "e4", piece: "pawn", color: "white", capture: false, ...extra }) as PlayedMove;
    it("tolera dados incompletos na notação", () => {
        expect(label(move({ color: undefined, piece: "knight", to: "f3" }))).toBe("♘f3");
        expect(label(move({ promotion: "x" as never, to: "e8" }))).toBe("e8=X");
        expect(label(move({ piece: "dragão" as never, to: "d4" }))).toBe("dragãod4");
        expect(label(undefined)).toBe("—");
    });
    it("permite clicar em lances das pretas e ignora teclas sem atalho", async () => {
        const onMoveClick = vi.fn(), onGoToEnd = vi.fn();
        const moves = [move({}), move({ color: "black", from: "e7", to: "e5" }), move({ from: "g1", to: "f3", piece: "knight" })];
        const { container } = await render(<MoveHistoryPanel moves={moves} onMoveClick={onMoveClick} onGoToEnd={onGoToEnd} />);
        const rows = container.querySelectorAll("tbody tr");
        expect(rows).toHaveLength(2);
        expect(rows[0].className).not.toContain("bg-surface-alt/50");
        expect(rows[1].className).toContain("bg-surface-alt/50");
        await click(rows[0].querySelectorAll("td button")[1] as HTMLButtonElement);
        expect(onMoveClick).toHaveBeenCalledExactlyOnceWith(1);
        const panel = container.querySelector<HTMLElement>('[tabindex="0"]')!;
        await act(async () => {
            panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
            panel.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
        });
        expect(onGoToEnd).toHaveBeenCalledTimes(1);
    });
    it("tolera posições vazias na lista de lances", async () => {
        const sparse = [undefined, move({ color: "black" })] as unknown as PlayedMove[];
        const { container } = await render(<MoveHistoryPanel moves={sparse} />);
        const cells = container.querySelectorAll("tbody td");
        expect(cells[0].textContent).toBe("—");
        expect(cells[0].querySelector("button")?.disabled ?? true).toBe(true);
    });
});
