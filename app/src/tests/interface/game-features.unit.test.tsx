// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { sortCapturedPieces } from "../../interface/utils/AuxFunctions";
import { label, MoveHistoryPanel } from "../../interface/components/Board_Components/MoveHistoryPanel";
import { PlayerBar } from "../../interface/components/Board_Components/PlayerBar";
import { FocusLayout } from "../../interface/components/layout/FocusLayout";
import { Game } from "../../interface/pages/Game";
import { Home } from "../../interface/pages/Home";
import { AuthProvider } from "../../interface/stores/AuthContext";
import { ThemeProvider } from "../../interface/stores/ThemeContext";
import type { PlayedMove } from "../../interface/hooks/useGameMoves";
import type { PieceType } from "../../interface/types/pieces";

// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("sortCapturedPieces - Ordenação de peças capturadas", () => {
    it("deve ordenar peças capturadas por valor crescente: peão, cavalo, bispo, torre, dama, rei", () => {
        const unsorted: PieceType[] = ["queen", "pawn", "knight", "rook", "bishop", "pawn"];
        const sorted = sortCapturedPieces(unsorted);
        expect(sorted).toEqual(["pawn", "pawn", "knight", "bishop", "rook", "queen"]);
    });

    it("deve manter lista vazia ou com um único elemento consistente", () => {
        expect(sortCapturedPieces([])).toEqual([]);
        expect(sortCapturedPieces(["rook"])).toEqual(["rook"]);
    });

    it("PlayerBar deve renderizar peças capturadas em ordem", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const player = { id: "p1", name: "Alice", color: "white" as const, avatarUrl: "", isBot: false };
        const captured: PieceType[] = ["queen", "pawn", "rook", "knight"];

        await act(async () => {
            root.render(<PlayerBar player={player} capturedPieces={captured} />);
        });

        const capturedGroup = container.querySelector('[aria-label="Peças capturadas"]');
        expect(capturedGroup).not.toBeNull();
        const images = capturedGroup?.querySelectorAll("img");
        expect(images?.length).toBe(4);

        await act(async () => {
            root.unmount();
        });
    });
});

describe("MoveHistoryPanel - Glifos Unicode nos registros de lances", () => {
    it("deve formatar lances de brancas com glifos unicode brancos (♔, ♕, ♖, ♗, ♘)", () => {
        const moveKnight: PlayedMove = { from: "g1", to: "f3", piece: "knight", color: "white", capture: false };
        const moveBishop: PlayedMove = { from: "f1", to: "c4", piece: "bishop", color: "white", capture: false };
        const moveRook: PlayedMove = { from: "a1", to: "d1", piece: "rook", color: "white", capture: true };
        const moveQueen: PlayedMove = { from: "d1", to: "h5", piece: "queen", color: "white", capture: false };
        const moveKing: PlayedMove = { from: "e1", to: "f1", piece: "king", color: "white", capture: false };

        expect(label(moveKnight)).toBe("♘f3");
        expect(label(moveBishop)).toBe("♗c4");
        expect(label(moveRook)).toBe("♖xd1");
        expect(label(moveQueen)).toBe("♕h5");
        expect(label(moveKing)).toBe("♔f1");
    });

    it("deve formatar lances de pretas com glifos unicode pretos (♚, ♛, ♜, ♝, ♞)", () => {
        const moveKnight: PlayedMove = { from: "b8", to: "c6", piece: "knight", color: "black", capture: false };
        const moveBishop: PlayedMove = { from: "f8", to: "b4", piece: "bishop", color: "black", capture: false };
        const moveRook: PlayedMove = { from: "h8", to: "e8", piece: "rook", color: "black", capture: true };
        const moveQueen: PlayedMove = { from: "d8", to: "f6", piece: "queen", color: "black", capture: false };
        const moveKing: PlayedMove = { from: "e8", to: "f8", piece: "king", color: "black", capture: false };

        expect(label(moveKnight)).toBe("♞c6");
        expect(label(moveBishop)).toBe("♝b4");
        expect(label(moveRook)).toBe("♜xe8");
        expect(label(moveQueen)).toBe("♛f6");
        expect(label(moveKing)).toBe("♚f8");
    });

    it("deve formatar lances de peão sem prefixo e promoção com glifo unicode", () => {
        const pawnMoveWhite: PlayedMove = { from: "e2", to: "e4", piece: "pawn", color: "white", capture: false };
        const pawnCaptureWhite: PlayedMove = { from: "e4", to: "d5", piece: "pawn", color: "white", capture: true };
        const pawnPromoWhite: PlayedMove = { from: "e7", to: "e8", piece: "pawn", color: "white", capture: false, promotion: "q" };

        const pawnMoveBlack: PlayedMove = { from: "e7", to: "e5", piece: "pawn", color: "black", capture: false };
        const pawnCaptureBlack: PlayedMove = { from: "c5", to: "d4", piece: "pawn", color: "black", capture: true };
        const pawnPromoBlack: PlayedMove = { from: "a2", to: "a1", piece: "pawn", color: "black", capture: false, promotion: "q" };

        expect(label(pawnMoveWhite)).toBe("e4");
        expect(label(pawnCaptureWhite)).toBe("exd5");
        expect(label(pawnPromoWhite)).toBe("e8=♕");

        expect(label(pawnMoveBlack)).toBe("e5");
        expect(label(pawnCaptureBlack)).toBe("cxd4");
        expect(label(pawnPromoBlack)).toBe("a1=♛");
    });

    it("deve formatar roques corretamente", () => {
        const castleKing: PlayedMove = { from: "e1", to: "g1", piece: "king", color: "white", capture: false, castle: "kingSide" };
        const castleQueen: PlayedMove = { from: "e8", to: "c8", piece: "king", color: "black", capture: false, castle: "queenSide" };

        expect(label(castleKing)).toBe("O-O");
        expect(label(castleQueen)).toBe("O-O-O");
    });

    it("deve renderizar glifos unicode na tabela do MoveHistoryPanel", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const moves: PlayedMove[] = [
            { from: "g1", to: "f3", piece: "knight", color: "white", capture: false },
            { from: "b8", to: "c6", piece: "knight", color: "black", capture: false },
        ];

        await act(async () => {
            root.render(<MoveHistoryPanel moves={moves} />);
        });

        const text = container.textContent;
        expect(text).toContain("♘f3");
        expect(text).toContain("♞c6");

        await act(async () => {
            root.unmount();
        });
    });
});

describe("FocusLayout - Scroll em telas menores e espaçamento do Header", () => {
    it("deve permitir scroll em telas menores (overflow-y-auto) e prevenir na tela principal desktop (lg:overflow-hidden)", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);

        await act(async () => {
            root.render(
                <MemoryRouter>
                    <AuthProvider>
                        <ThemeProvider>
                            <FocusLayout />
                        </ThemeProvider>
                    </AuthProvider>
                </MemoryRouter>
            );
        });

        const main = container.querySelector("main");
        expect(main).not.toBeNull();
        expect(main?.className).toContain("overflow-y-auto");
        expect(main?.className).toContain("lg:overflow-hidden");

        const headerContainer = container.querySelector("header > div");
        expect(headerContainer?.className).toContain("py-3");

        const rightControls = headerContainer?.children[1];
        expect(rightControls?.className).toContain("gap-4");

        await act(async () => {
            root.unmount();
        });
    });
});

describe("Modo IA vs IA - Pausar ao consultar histórico e despausar ao retornar", () => {
    it("deve pausar o jogo no modo IA vs IA ao consultar estado antigo e despausar ao retornar ao vivo", async () => {
        vi.useFakeTimers();

        const container = document.createElement("div");
        const root = createRoot(container);

        await act(async () => {
            root.render(
                <MemoryRouter>
                    <ThemeProvider>
                        <AuthProvider>
                            <Game />
                        </AuthProvider>
                    </ThemeProvider>
                </MemoryRouter>
            );
        });

        // Seleciona o modo IA vs IA no GameSetupForm
        const aiAiRadio = container.querySelector('input[value="ai-ai"]') as HTMLInputElement;
        expect(aiAiRadio).not.toBeNull();
        await act(async () => {
            aiAiRadio.click();
        });

        // Inicia a partida
        const form = container.querySelector("form");
        await act(async () => {
            form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        });

        // Deve exibir Status inicial com "As IAs estão jogando."
        expect(container.textContent).toContain("As IAs estão jogando.");

        // Avança o timer para a primeira IA calcular e jogar um lance
        await act(async () => {
            await vi.advanceTimersByTimeAsync(3000);
        });

        // Deve haver pelo menos 1 lance no histórico
        const moveButtons = container.querySelectorAll("td button");
        expect(moveButtons.length).toBeGreaterThanOrEqual(1);

        // Clica no botão para ir ao início da partida (consultar estado anterior)
        const goToStartBtn = container.querySelector('button[aria-label="Ir ao início da partida"]') as HTMLButtonElement;
        expect(goToStartBtn).not.toBeNull();
        await act(async () => {
            goToStartBtn.click();
        });

        // Deve mostrar o status de partida pausada
        expect(container.textContent).toContain("Partida pausada");
        expect(container.textContent).toContain("Partida das IAs pausada");

        // Enquanto pausado, avança o tempo e verifica que as IAs continuam pausadas
        await act(async () => {
            await vi.advanceTimersByTimeAsync(3000);
        });
        expect(container.textContent).toContain("Partida pausada");

        // Clica no botão "Voltar ao lance atual" para retornar ao estado ao vivo
        const returnLiveBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
            btn.textContent?.includes("Voltar ao lance atual")
        );
        expect(returnLiveBtn).toBeDefined();

        await act(async () => {
            returnLiveBtn?.click();
        });

        // Ao retornar ao vivo, deve despausar e voltar a mostrar "As IAs estão jogando."
        expect(container.textContent).not.toContain("Partida das IAs pausada");
        expect(container.textContent).toContain("As IAs estão jogando.");

        // Avança o timer para a segunda IA jogar (2 lances no total)
        await act(async () => {
            await vi.advanceTimersByTimeAsync(3000);
        });

        // Agora clica diretamente no 1º lance (com 2 lances, consultar o 1º é consultar o passado)
        const updatedMoveButtons = container.querySelectorAll("td button");
        expect(updatedMoveButtons.length).toBeGreaterThanOrEqual(2);
        await act(async () => {
            (updatedMoveButtons[0] as HTMLButtonElement).click();
        });

        // Deve pausar novamente
        expect(container.textContent).toContain("Partida pausada");
        expect(container.textContent).toContain("Partida das IAs pausada");

        // Retorna ao vivo novamente
        const returnLiveBtn2 = Array.from(container.querySelectorAll("button")).find((btn) =>
            btn.textContent?.includes("Voltar ao lance atual")
        );
        await act(async () => {
            returnLiveBtn2?.click();
        });

        expect(container.textContent).toContain("As IAs estão jogando.");

        await act(async () => {
            root.unmount();
        });

        vi.useRealTimers();
    });
});

describe("Home - Componente Piece3D atrás dos textos de título", () => {
    it("deve renderizar o Piece3D posicionado atrás dos textos de título na tela principal", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);

        await act(async () => {
            root.render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            );
        });

        const h1 = container.querySelector("h1");
        expect(h1).not.toBeNull();
        expect(h1?.textContent).toContain("Jogo de Xadrez Web");
        expect(h1?.textContent).toContain("Engenharia de Software II");
        expect(h1?.className).toContain("relative");
        expect(h1?.className).toContain("z-10");

        // O wrapper de Piece3D deve estar no mesmo container pai, posicionado atrás com z-0
        const parent = h1?.parentElement;
        expect(parent).not.toBeNull();
        expect(parent?.className).toContain("relative");

        const piece3DWrapper = parent?.firstElementChild;
        expect(piece3DWrapper).not.toBeNull();
        expect(piece3DWrapper?.className).toContain("absolute");
        expect(piece3DWrapper?.className).toContain("pointer-events-none");
        expect(piece3DWrapper?.className).toContain("z-0");

        // Deve conter o elemento SVG tridimensional de Piece3D
        const svg = piece3DWrapper?.querySelector("svg");
        expect(svg).not.toBeNull();

        await act(async () => {
            root.unmount();
        });
    });
});
