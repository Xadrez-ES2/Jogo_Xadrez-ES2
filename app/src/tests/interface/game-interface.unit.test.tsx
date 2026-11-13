// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { GameSetupForm } from "../../interface/components/GameSetupForm";
import { MoveHistoryPanel } from "../../interface/components/Board_Components/MoveHistoryPanel";
import { useChessClock } from "../../interface/hooks/useChessClock";
import { useHistoryNavigation } from "../../interface/hooks/useHistoryNavigation";
import { createGame } from "../../engine";
import type { PlayedMove } from "../../interface/hooks/useGameMoves";

// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setInputValue(input: HTMLInputElement, value: string) {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("GameSetupForm - Opções de tempo", () => {
    it("deve renderizar as 5 opções de tempo: 10 min, 5 min, 2 min, Sem tempo e Tempo customizado", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);

        await act(async () => {
            root.render(<GameSetupForm onStart={() => {}} />);
        });

        const labels = Array.from(container.querySelectorAll("label")).map((l) => l.textContent?.trim());
        expect(labels.some((text) => text?.includes("10 min"))).toBe(true);
        expect(labels.some((text) => text?.includes("5 min"))).toBe(true);
        expect(labels.some((text) => text?.includes("2 min"))).toBe(true);
        expect(labels.some((text) => text?.includes("Sem tempo"))).toBe(true);
        expect(labels.some((text) => text?.includes("Tempo customizado"))).toBe(true);

        await act(async () => {
            root.unmount();
        });
    });

    it("deve submeter 10 min por padrão (600.000 ms)", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const onStart = vi.fn();

        await act(async () => {
            root.render(<GameSetupForm onStart={onStart} />);
        });

        const form = container.querySelector("form");
        await act(async () => {
            form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        });

        expect(onStart).toHaveBeenCalledWith(
            expect.objectContaining({
                timeLimitMs: 600000,
                timeOption: "10min",
            })
        );

        await act(async () => {
            root.unmount();
        });
    });

    it("deve permitir selecionar 5 min (300.000 ms)", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const onStart = vi.fn();

        await act(async () => {
            root.render(<GameSetupForm onStart={onStart} />);
        });

        const opt5min = container.querySelector('input[value="5min"]') as HTMLInputElement;
        await act(async () => {
            opt5min.click();
        });

        const form = container.querySelector("form");
        await act(async () => {
            form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        });

        expect(onStart).toHaveBeenCalledWith(
            expect.objectContaining({
                timeLimitMs: 300000,
                timeOption: "5min",
            })
        );

        await act(async () => {
            root.unmount();
        });
    });

    it("deve permitir selecionar 2 min (120.000 ms)", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const onStart = vi.fn();

        await act(async () => {
            root.render(<GameSetupForm onStart={onStart} />);
        });

        const opt2min = container.querySelector('input[value="2min"]') as HTMLInputElement;
        await act(async () => {
            opt2min.click();
        });

        const form = container.querySelector("form");
        await act(async () => {
            form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        });

        expect(onStart).toHaveBeenCalledWith(
            expect.objectContaining({
                timeLimitMs: 120000,
                timeOption: "2min",
            })
        );

        await act(async () => {
            root.unmount();
        });
    });

    it("deve permitir selecionar 'Sem tempo' e submeter timeLimitMs como null", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const onStart = vi.fn();

        await act(async () => {
            root.render(<GameSetupForm onStart={onStart} />);
        });

        const semTempoInput = container.querySelector('input[value="none"]') as HTMLInputElement;
        expect(semTempoInput).not.toBeNull();

        await act(async () => {
            semTempoInput.click();
        });

        const form = container.querySelector("form");
        await act(async () => {
            form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        });

        expect(onStart).toHaveBeenCalledWith(
            expect.objectContaining({
                timeLimitMs: null,
                timeOption: "none",
            })
        );

        await act(async () => {
            root.unmount();
        });
    });

    it("deve exibir campo de entrada quando 'Tempo customizado' é selecionado e calcular o tempo em ms", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const onStart = vi.fn();

        await act(async () => {
            root.render(<GameSetupForm onStart={onStart} />);
        });

        const customInput = container.querySelector('input[value="custom"]') as HTMLInputElement;
        await act(async () => {
            customInput.click();
        });

        const minutesInput = container.querySelector("#custom-minutes") as HTMLInputElement;
        expect(minutesInput).not.toBeNull();

        await act(async () => {
            setInputValue(minutesInput, "15");
        });

        const form = container.querySelector("form");
        await act(async () => {
            form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        });

        expect(onStart).toHaveBeenCalledWith(
            expect.objectContaining({
                timeLimitMs: 15 * 60 * 1000,
                timeOption: "custom",
                customMinutes: 15,
            })
        );

        await act(async () => {
            root.unmount();
        });
    });
});

describe("MoveHistoryPanel - Botões compactos de Pausar e Desistir", () => {
    const sampleMoves: PlayedMove[] = [
        { from: "e2", to: "e4", piece: "pawn", color: "white", capture: false },
        { from: "e7", to: "e5", piece: "pawn", color: "black", capture: false },
    ];

    it("deve renderizar botões compactos de pausar e desistir com símbolos", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const onTogglePause = vi.fn();
        const onResign = vi.fn();

        await act(async () => {
            root.render(
                <MoveHistoryPanel
                    moves={sampleMoves}
                    canPause={true}
                    isPaused={false}
                    onTogglePause={onTogglePause}
                    canResign={true}
                    onResign={onResign}
                />
            );
        });

        const pauseBtn = container.querySelector('button[aria-label="Pausar partida"]') as HTMLButtonElement;
        expect(pauseBtn).not.toBeNull();
        expect(pauseBtn.querySelector("svg")).not.toBeNull();

        const resignBtn = container.querySelector('button[aria-label="Desistir da partida"]') as HTMLButtonElement;
        expect(resignBtn).not.toBeNull();
        expect(resignBtn.querySelector("svg")).not.toBeNull();

        await act(async () => {
            pauseBtn.click();
            resignBtn.click();
        });

        expect(onTogglePause).toHaveBeenCalledTimes(1);
        expect(onResign).toHaveBeenCalledTimes(1);

        await act(async () => {
            root.unmount();
        });
    });

    it("deve exibir símbolo e texto de Retomar quando isPaused for true", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);

        await act(async () => {
            root.render(
                <MoveHistoryPanel
                    moves={sampleMoves}
                    canPause={true}
                    isPaused={true}
                    onTogglePause={() => {}}
                />
            );
        });

        const resumeBtn = container.querySelector('button[aria-label="Retomar partida"]') as HTMLButtonElement;
        expect(resumeBtn).not.toBeNull();

        await act(async () => {
            root.unmount();
        });
    });

    it("deve permitir navegação por setas do teclado no painel", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        const onGoBack = vi.fn();
        const onGoForward = vi.fn();
        const onGoToStart = vi.fn();
        const onGoToEnd = vi.fn();

        await act(async () => {
            root.render(
                <MoveHistoryPanel
                    moves={sampleMoves}
                    onGoBack={onGoBack}
                    onGoForward={onGoForward}
                    onGoToStart={onGoToStart}
                    onGoToEnd={onGoToEnd}
                />
            );
        });

        const section = container.querySelector("section") as HTMLElement;
        expect(section).not.toBeNull();

        await act(async () => {
            section.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
        });
        expect(onGoBack).toHaveBeenCalledTimes(1);

        await act(async () => {
            section.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        });
        expect(onGoForward).toHaveBeenCalledTimes(1);

        await act(async () => {
            section.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
        });
        expect(onGoToStart).toHaveBeenCalledTimes(1);

        await act(async () => {
            section.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
        });
        expect(onGoToEnd).toHaveBeenCalledTimes(1);

        await act(async () => {
            root.unmount();
        });
    });
});

describe("useChessClock - Integração de tempo e Sem tempo", () => {
    it("deve retornar undefined quando initialTimeMs é null (Sem tempo)", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        let clockResult: unknown = "not-called";

        function TestComponent() {
            clockResult = useChessClock({
                activeColor: "white",
                running: true,
                resetKey: 0,
                onTimeout: () => {},
                initialTimeMs: null,
            });
            return null;
        }

        await act(async () => {
            root.render(<TestComponent />);
        });

        expect(clockResult).toBeUndefined();

        await act(async () => {
            root.unmount();
        });
    });

    it("deve inicializar com o tempo correto quando fornecido (ex: 5 min = 300.000 ms)", async () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        let clockResult: unknown = null;

        function TestComponent() {
            clockResult = useChessClock({
                activeColor: "white",
                running: false,
                resetKey: 0,
                onTimeout: () => {},
                initialTimeMs: 5 * 60 * 1000,
            });
            return null;
        }

        await act(async () => {
            root.render(<TestComponent />);
        });

        expect(clockResult).toEqual({
            white: 300000,
            black: 300000,
        });

        await act(async () => {
            root.unmount();
        });
    });
});

describe("useHistoryNavigation - Navegação e limites", () => {
    it("deve navegar entre lances com goBack, goForward, goToStart e goToEnd", async () => {
        const dummySnapshots = [createGame(), createGame(), createGame()];
        const dummyHistory: PlayedMove[] = [
            { from: "e2", to: "e4", piece: "pawn", color: "white", capture: false },
            { from: "e7", to: "e5", piece: "pawn", color: "black", capture: false },
        ];

        let nav!: ReturnType<typeof useHistoryNavigation>;

        function TestComponent() {
            nav = useHistoryNavigation(dummySnapshots, dummyHistory);
            return null;
        }

        const container = document.createElement("div");
        const root = createRoot(container);

        await act(async () => {
            root.render(<TestComponent />);
        });

        // Inicialmente ao vivo (isViewingHistory false)
        expect(nav.isViewingHistory).toBe(false);

        // Recua um lance (vai para lance 1)
        await act(async () => {
            nav.goBack();
        });
        expect(nav.isViewingHistory).toBe(true);
        expect(nav.viewIndex).toBe(1);

        // Recua até o início
        await act(async () => {
            nav.goToStart();
        });
        expect(nav.viewIndex).toBe(0);

        // Avança um lance
        await act(async () => {
            nav.goForward();
        });
        expect(nav.viewIndex).toBe(1);

        // Avança até o final (retorna ao vivo)
        await act(async () => {
            nav.goForward();
        });
        expect(nav.isViewingHistory).toBe(false);

        await act(async () => {
            root.unmount();
        });
    });
});
