import { useState } from "react";
import type { GameMode, GameSetup, TimeControlOption, PlayerColorChoice } from "../types/gameSetup";
import { gameModeLabels, TIME_PRESETS_MS } from "../types/gameSetup";
import { Button } from "./ui/Button";

export function GameSetupForm({ onStart }: { onStart: (setup: GameSetup) => void }) {
    const [mode, setMode] = useState<GameMode>("human-ai");
    const [difficulty, setDifficulty] = useState<GameSetup["difficulty"]>("easy");
    const [timeOption, setTimeOption] = useState<TimeControlOption>("10min");
    const [playerColor, setPlayerColor] = useState<PlayerColorChoice>("random");
    const hasAI = mode !== "human-human";

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const timeLimitMs: number | null = (() => {
            switch (timeOption) {
                case "10min":
                    return TIME_PRESETS_MS["10min"];
                case "5min":
                    return TIME_PRESETS_MS["5min"];
                case "2min":
                    return TIME_PRESETS_MS["2min"];
                case "1min":
                    return TIME_PRESETS_MS["1min"];
                case "none":
                    return null;
            }
        })();

        // Resolve "random" into a concrete color before passing to the game session
        const resolvedColor: PlayerColorChoice =
            playerColor === "random"
                ? Math.random() < 0.5 ? "white" : "black"
                : playerColor;

        onStart({
            mode,
            difficulty,
            timeLimitMs,
            timeOption,
            playerColor: hasAI ? resolvedColor : undefined,
        });
    }

    return (
        <div className="w-full px-4 py-6 sm:px-6">
            <form
                className="mx-auto w-full max-w-lg rounded-xl border border-border bg-surface px-6 py-5"
                onSubmit={handleSubmit}
            >
                <h1 className="font-display text-2xl font-semibold">Nova partida</h1>

                {/* Tipo de jogo */}
                <fieldset className="mt-5">
                    <legend className="mb-3 font-semibold">Tipo de jogo</legend>
                    <div className="flex flex-col gap-2">
                        {(Object.keys(gameModeLabels) as GameMode[]).map((value) => (
                            <label
                                key={value}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                                    mode === value ? "border-accent bg-surface-alt" : "border-border"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="game-mode"
                                    value={value}
                                    checked={mode === value}
                                    onChange={() => setMode(value)}
                                />
                                {gameModeLabels[value]}
                            </label>
                        ))}
                    </div>
                </fieldset>

                {/* Dificuldade da IA */}
                {hasAI && (
                    <div className="mt-5">
                        <label htmlFor="game-difficulty" className="block font-semibold">
                            Dificuldade da IA
                        </label>
                        <select
                            id="game-difficulty"
                            value={difficulty}
                            onChange={(event) =>
                                setDifficulty(event.target.value as GameSetup["difficulty"])
                            }
                            className="mt-2 w-full rounded-lg border border-border bg-surface-alt p-3 text-text-primary"
                        >
                            <option value="easy">Fácil</option>
                            <option value="medium">Médio</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </div>
                )}

                {/* Escolha da cor das peças */}
                {mode === "human-ai" && (
                    <fieldset className="mt-5">
                        <legend className="mb-3 font-semibold">Sua cor</legend>
                        <div className="grid grid-cols-3 gap-3">
                            {(
                                [
                                    { value: "random", label: "Aleatório", icon: "🎲" },
                                    { value: "white",  label: "Brancas",   icon: "♔" },
                                    { value: "black",  label: "Pretas",    icon: "♚" },
                                ] as { value: PlayerColorChoice; label: string; icon: string }[]
                            ).map(({ value, label, icon }) => (
                                <label
                                    key={value}
                                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-sm font-medium transition-colors ${
                                        playerColor === value
                                            ? "border-accent bg-surface-alt text-text-primary"
                                            : "border-border text-text-muted hover:border-accent/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="player-color"
                                        value={value}
                                        checked={playerColor === value}
                                        onChange={() => setPlayerColor(value)}
                                        className="sr-only"
                                    />
                                    <span className="text-2xl leading-none" aria-hidden="true">{icon}</span>
                                    {label}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                )}

                {/* Opções de tempo de cada jogador */}
                <fieldset className="mt-5">
                    <legend className="mb-3 font-semibold">Tempo de cada jogador</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(
                            [
                                { value: "10min", label: "10 min" },
                                { value: "5min",  label: "5 min"  },
                                { value: "2min",  label: "2 min"  },
                                { value: "1min",  label: "1 min"  },
                            ] as { value: TimeControlOption; label: string }[]
                        ).map(({ value, label }) => (
                            <label
                                key={value}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                                    timeOption === value
                                        ? "border-accent bg-surface-alt text-text-primary"
                                        : "border-border text-text-muted hover:border-accent/50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="time-option"
                                    value={value}
                                    checked={timeOption === value}
                                    onChange={() => setTimeOption(value)}
                                    className="accent-accent"
                                />
                                {label}
                            </label>
                        ))}

                        <label
                            className={`col-span-2 sm:col-span-4 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                                timeOption === "none"
                                    ? "border-accent bg-surface-alt text-text-primary"
                                    : "border-border text-text-muted hover:border-accent/50"
                            }`}
                        >
                            <input
                                type="radio"
                                name="time-option"
                                value="none"
                                checked={timeOption === "none"}
                                onChange={() => setTimeOption("none")}
                                className="accent-accent"
                            />
                            Sem tempo
                        </label>
                    </div>
                </fieldset>

                <Button type="submit" className="mt-6">
                    Iniciar partida
                </Button>
            </form>
        </div>
    );
}
