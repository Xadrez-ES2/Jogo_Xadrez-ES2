// @vitest-environment jsdom
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { initialBoard, parseFenBoard, STARTING_POSITION_FEN } from "../../../interface/FEN";
import { BoardArrowsOverlay } from "../../../interface/components/Board_Components/BoardArrowOverlay";
import { useSquareSelection } from "../../../interface/hooks/useSquareSelection";
import { useSoundEffects } from "../../../interface/hooks/useSoundEffects";
import { sortCapturedPieces } from "../../../interface/utils/AuxFunctions";
import { mountHook, render } from "./harness";

describe("U-FEN — conversão da notação FEN para o tabuleiro visual", () => {
    it("monta a posição inicial com 32 peças nas casas corretas", () => {
        const board = parseFenBoard(STARTING_POSITION_FEN);
        expect(Object.keys(board)).toHaveLength(32);
        expect(board.e1).toEqual({ piece: { type: "king" }, color: "white" });
        expect(board.d8).toEqual({ piece: { type: "queen" }, color: "black" });
        expect(board.g1).toEqual({ piece: { type: "knight" }, color: "white" });
        expect(board.e4).toBeUndefined();
        expect(initialBoard).toEqual(board);
    });
    it("interpreta casas vazias e ignora os demais campos da FEN", () => {
        const board = parseFenBoard("  8/8/8/3k4/8/8/4P3/4K3 b - - 10 42  ");
        expect(board).toEqual({
            d5: { piece: { type: "king" }, color: "black" },
            e2: { piece: { type: "pawn" }, color: "white" },
            e1: { piece: { type: "king" }, color: "white" },
        });
    });
    it.each([
        ["8/8/8/8/8/8/8", /esperado 8 linhas.*recebido 7/],
        ["8/8/8/8/8/8/8/8/8", /recebido 9/],
        ["8/8/8/8/8/8/8/8p", /ultrapassa 8 colunas/],
        ["8/8/8/8/8/8/8/7x", /caractere de peça desconhecido "x"/],
    ])("rejeita FEN inválida %s", (fen, message) => {
        expect(() => parseFenBoard(fen)).toThrow(message);
    });
});

describe("U-SETA — camada SVG das setas desenhadas", () => {
    it("não renderiza nada sem setas", async () => {
        const { container } = await render(<BoardArrowsOverlay arrows={[]} orientation="white" />);
        expect(container.innerHTML).toBe("");
    });
    it("posiciona a seta pelo centro das casas e encurta a ponta", async () => {
        const { container } = await render(<BoardArrowsOverlay arrows={[{ from: "e2", to: "e4" }]} orientation="white" />);
        const line = container.querySelector("line")!;
        expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
        expect(line.getAttribute("x1")).toBe("4.5");
        expect(line.getAttribute("y1")).toBe("6.5");
        expect(line.getAttribute("x2")).toBe("4.5");
        expect(Number(line.getAttribute("y2"))).toBeCloseTo(4.5 + 0.38);
    });
    it("inverte as coordenadas quando o tabuleiro está do lado das pretas", async () => {
        const { container } = await render(<BoardArrowsOverlay
            arrows={[{ from: "a1", to: "h8" }, { from: "b1", to: "c3" }]} orientation="black" />);
        const [diagonal, knight] = container.querySelectorAll("line");
        expect(diagonal.getAttribute("x1")).toBe("7.5");
        expect(diagonal.getAttribute("y1")).toBe("0.5");
        expect(Number(diagonal.getAttribute("x2"))).toBeLessThan(0.5 + 0.38);
        expect(knight.getAttribute("x1")).toBe("6.5");
    });
    it("tolera seta de comprimento zero sem gerar NaN", async () => {
        const { container } = await render(<BoardArrowsOverlay arrows={[{ from: "d4", to: "d4" }]} orientation="white" />);
        const line = container.querySelector("line")!;
        expect(Number.isNaN(Number(line.getAttribute("x2")))).toBe(false);
    });
});

describe("U-SELECAO — seleção de casas", () => {
    it("seleciona, troca, desmarca ao repetir e limpa", async () => {
        const hook = await mountHook(useSquareSelection, undefined);
        expect(hook.current.selectedSquare).toBeUndefined();
        await act(async () => hook.current.handleSquareSelect("e2"));
        expect(hook.current.selectedSquare).toBe("e2");
        await act(async () => hook.current.handleSquareSelect("d2"));
        expect(hook.current.selectedSquare).toBe("d2");
        await act(async () => hook.current.handleSquareSelect("d2"));
        expect(hook.current.selectedSquare).toBeUndefined();
        await act(async () => hook.current.handleSquareSelect("a1"));
        await act(async () => hook.current.clearSelection());
        expect(hook.current.selectedSquare).toBeUndefined();
    });
});

describe("U-SOM — efeitos sonoros tolerantes a falhas", () => {
    function stubAudio(play: () => Promise<void> | undefined = () => Promise.resolve()) {
        const created: { src: string; volume: number; preload: string }[] = [];
        const played = vi.fn(play);
        vi.stubGlobal("Audio", class {
            preload = ""; volume = 1;
            src: string;
            constructor(src: string) { this.src = src; created.push(this); }
            play() { return played(); }
        });
        return { created, played };
    }

    it("pré-carrega os arquivos e toca com volume reduzido", async () => {
        const audio = stubAudio();
        const hook = await mountHook(useSoundEffects, undefined);
        expect(audio.created.length).toBeGreaterThanOrEqual(6);
        expect(audio.created.every((item) => item.preload === "auto")).toBe(true);
        hook.current.play("capture");
        expect(audio.played).toHaveBeenCalledTimes(1);
        expect(audio.created.at(-1)).toMatchObject({ src: expect.stringContaining("Capture.mp3"), volume: 0.7 });
    });
    it("persiste o mudo e não toca enquanto mudo", async () => {
        const audio = stubAudio();
        const hook = await mountHook(useSoundEffects, undefined);
        expect(hook.current.isMuted()).toBe(false);
        expect(hook.current.toggleMute()).toBe(true);
        expect(localStorage.getItem("chess-muted")).toBe("true");
        hook.current.play("move");
        expect(audio.played).not.toHaveBeenCalled();
        expect(hook.current.toggleMute()).toBe(false);
        expect(localStorage.getItem("chess-muted")).toBe("false");
    });
    it("recupera a preferência salva ao montar", async () => {
        stubAudio();
        localStorage.setItem("chess-muted", "true");
        const hook = await mountHook(useSoundEffects, undefined);
        expect(hook.current.isMuted()).toBe(true);
    });
    it("ignora autoplay bloqueado, play sem promessa e construtor que falha", async () => {
        const audio = stubAudio(() => Promise.reject(new Error("autoplay bloqueado")));
        const hook = await mountHook(useSoundEffects, undefined);
        expect(() => hook.current.play("check")).not.toThrow();
        audio.played.mockImplementation(() => undefined);
        expect(() => hook.current.play("castle")).not.toThrow();
        vi.stubGlobal("Audio", class { constructor() { throw new Error("sem áudio"); } });
        expect(() => hook.current.play("gameOver")).not.toThrow();
        await mountHook(useSoundEffects, undefined);
    });
    it("funciona sem Audio e sem localStorage disponíveis", async () => {
        vi.stubGlobal("Audio", undefined);
        const storage = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("bloqueado"); });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("bloqueado"); });
        const hook = await mountHook(useSoundEffects, undefined);
        expect(storage).toHaveBeenCalled();
        expect(hook.current.isMuted()).toBe(false);
        expect(() => hook.current.play("move")).not.toThrow();
        expect(hook.current.toggleMute()).toBe(true);
    });
});

describe("U-SOM-EXTRA — eventos e peças desconhecidos", () => {
    it("ignora evento sonoro sem arquivo associado", async () => {
        const play = vi.fn(() => Promise.resolve());
        vi.stubGlobal("Audio", class { preload = ""; volume = 1; play = play; });
        const hook = await mountHook(useSoundEffects, undefined);
        hook.current.play("inexistente" as never);
        expect(play).not.toHaveBeenCalled();
    });
    it("ordena peças desconhecidas depois das conhecidas", () => {
        expect(sortCapturedPieces(["dragão" as never, "pawn", "unicórnio" as never, "queen"]))
            .toEqual(["pawn", "queen", "dragão", "unicórnio"]);
    });
});

describe("U-SOM-CAMINHOS — arquivos de áudio publicados", () => {
    it("aponta para a pasta pública a partir da raiz do app em desenvolvimento", async () => {
        const { SOUND_MAP } = await import("../../../interface/hooks/useSoundEffects");
        expect(SOUND_MAP.move).toBe("/sounds/Move.mp3");
        for (const url of Object.values(SOUND_MAP)) expect(url.startsWith("/sounds/")).toBe(true);
    });
    it("usa o base do GitHub Pages em produção, sem caminhos relativos", async () => {
        vi.resetModules();
        vi.stubEnv("BASE_URL", "/Jogo_Xadrez-ES2/");
        try {
            const { SOUND_MAP } = await import("../../../interface/hooks/useSoundEffects");
            expect(SOUND_MAP.capture).toBe("/Jogo_Xadrez-ES2/sounds/Capture.mp3");
            for (const url of Object.values(SOUND_MAP)) {
                expect(url).not.toContain("..");
                // Resolvido a partir da página publicada, o endereço continua dentro do site.
                expect(new URL(url, "https://exemplo.github.io/Jogo_Xadrez-ES2/#/game").pathname.startsWith("/Jogo_Xadrez-ES2/sounds/")).toBe(true);
            }
        } finally {
            vi.unstubAllEnvs();
            vi.resetModules();
        }
    });
    it("todo som mapeado existe em app/public/sounds", async () => {
        // O glob do Vite lista os arquivos reais da pasta pública, sem depender de APIs do Node.
        const published = Object.keys(import.meta.glob("../../../../public/sounds/*.mp3")).map((path) => path.split("/").pop());
        const { SOUND_MAP } = await import("../../../interface/hooks/useSoundEffects");
        expect(published.length).toBeGreaterThan(0);
        for (const url of Object.values(SOUND_MAP)) expect(published).toContain(url.split("/").pop());
    });
});
