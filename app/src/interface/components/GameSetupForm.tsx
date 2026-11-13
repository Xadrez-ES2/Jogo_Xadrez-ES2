import { useState } from "react";
import type { GameMode, GameSetup, TimeControlOption } from "../types/gameSetup";
import { gameModeLabels, TIME_PRESETS_MS } from "../types/gameSetup";
import { Button } from "./ui/Button";

export function GameSetupForm({ onStart }: { onStart: (setup: GameSetup) => void }) {
    const [mode, setMode] = useState<GameMode>("human-ai");
    const [difficulty, setDifficulty] = useState<GameSetup["difficulty"]>("easy");
    const [timeOption, setTimeOption] = useState<TimeControlOption>("10min");
    const [customMinutes, setCustomMinutes] = useState<number>(3);
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
                case "none":
                    return null;
                case "custom":
                    return Math.max(1, customMinutes) * 60 * 1000;
            }
        })();

        onStart({
            mode,
            difficulty,
            timeLimitMs,
            timeOption,
            customMinutes: timeOption === "custom" ? customMinutes : undefined,
        });
    }

    return (
        <div className="flex flex-1 items-center justify-center px-6 py-6">
            <form
                className="w-full max-w-lg rounded-xl border border-border bg-surface p-6"
                onSubmit={handleSubmit}
            >
                <h1 className="font-display text-2xl font-semibold">Nova partida</h1>

                {/* Tipo de jogo */}
                <fieldset className="mt-6">
                    <legend className="mb-3 font-semibold">Tipo de jogo</legend>
                    <div className="flex flex-col gap-3">
                        {(Object.keys(gameModeLabels) as GameMode[]).map((value) => (
                            <label
                                key={value}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
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
                    <div className="mt-6">
                        <label htmlFor="game-difficulty" className="block font-semibold">
                            Dificuldade da IA
                        </label>
                        <select
                            id="game-difficulty"
                            value={difficulty}
                            onChange={(event) =>
                                setDifficulty(event.target.value as GameSetup["difficulty"])
                            }
                            className="mt-3 w-full rounded-lg border border-border bg-surface-alt p-3 text-text-primary"
                        >
                            <option value="easy">Fácil</option>
                            <option value="medium">Médio</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </div>
                )}

                {/* Opções de tempo de cada jogador */}
                <fieldset className="mt-6">
                    <legend className="mb-3 font-semibold">Tempo de cada jogador</legend>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <label
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                                timeOption === "10min"
                                    ? "border-accent bg-surface-alt text-text-primary"
                                    : "border-border text-text-muted hover:border-accent/50"
                            }`}
                        >
                            <input
                                type="radio"
                                name="time-option"
                                value="10min"
                                checked={timeOption === "10min"}
                                onChange={() => setTimeOption("10min")}
                                className="accent-accent"
                            />
                            10 min
                        </label>

                        <label
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                                timeOption === "5min"
                                    ? "border-accent bg-surface-alt text-text-primary"
                                    : "border-border text-text-muted hover:border-accent/50"
                            }`}
                        >
                            <input
                                type="radio"
                                name="time-option"
                                value="5min"
                                checked={timeOption === "5min"}
                                onChange={() => setTimeOption("5min")}
                                className="accent-accent"
                            />
                            5 min
                        </label>

                        <label
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                                timeOption === "2min"
                                    ? "border-accent bg-surface-alt text-text-primary"
                                    : "border-border text-text-muted hover:border-accent/50"
                            }`}
                        >
                            <input
                                type="radio"
                                name="time-option"
                                value="2min"
                                checked={timeOption === "2min"}
                                onChange={() => setTimeOption("2min")}
                                className="accent-accent"
                            />
                            2 min
                        </label>

                        <label
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
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

                        <label
                            className={`col-span-2 sm:col-span-2 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                                timeOption === "custom"
                                    ? "border-accent bg-surface-alt text-text-primary"
                                    : "border-border text-text-muted hover:border-accent/50"
                            }`}
                        >
                            <input
                                type="radio"
                                name="time-option"
                                value="custom"
                                checked={timeOption === "custom"}
                                onChange={() => setTimeOption("custom")}
                                className="accent-accent"
                            />
                            Tempo customizado
                        </label>
                    </div>

                    {/* Campo de entrada para tempo customizado */}
                    {timeOption === "custom" && (
                        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-surface-alt p-3">
                            <label htmlFor="custom-minutes" className="text-sm font-medium text-text-muted">
                                Duração por jogador:
                            </label>
                            <input
                                id="custom-minutes"
                                type="number"
                                min="1"
                                max="180"
                                value={customMinutes}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setCustomMinutes(Number.isNaN(val) ? 1 : Math.max(1, Math.min(180, val)));
                                }}
                                className="w-24 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-sm text-text-primary focus:border-accent focus:outline-none"
                            />
                            <span className="text-xs text-text-muted">min</span>
                        </div>
                    )}
                </fieldset>

                <Button type="submit" className="mt-6">
                    Iniciar partida
                </Button>
            </form>
        </div>
    );
}
