import { useState } from "react";
import type { GameMode, GameSetup } from "../types/gameSetup";
import { gameModeLabels } from "../types/gameSetup";
import { Button } from "./ui/Button";

export function GameSetupForm({ onStart }: { onStart: (setup: GameSetup) => void }) {
    const [mode, setMode] = useState<GameMode>("human-ai");
    const [difficulty, setDifficulty] = useState<GameSetup["difficulty"]>("easy");
    const hasAI = mode !== "human-human";
    return (
        <div className="flex flex-1 items-center justify-center px-6 py-6">
            <form className="w-full max-w-lg rounded-xl border border-border bg-surface p-6"
                onSubmit={(event) => { event.preventDefault(); onStart({ mode, difficulty }); }}>
                <h1 className="font-display text-2xl font-semibold">Nova partida</h1>
                <fieldset className="mt-6">
                    <legend className="mb-3 font-semibold">Tipo de jogo</legend>
                    <div className="flex flex-col gap-3">
                        {(Object.keys(gameModeLabels) as GameMode[]).map((value) => (
                            <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${mode === value ? "border-accent bg-surface-alt" : "border-border"}`}>
                                <input type="radio" name="game-mode" value={value} checked={mode === value}
                                    onChange={() => setMode(value)} />
                                {gameModeLabels[value]}
                            </label>
                        ))}
                    </div>
                </fieldset>
                {hasAI && (
                    <div className="mt-6">
                        <label htmlFor="game-difficulty" className="block font-semibold">Dificuldade da IA</label>
                        <select id="game-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value as GameSetup["difficulty"])}
                            className="mt-3 w-full rounded-lg border border-border bg-surface-alt p-3 text-text-primary">
                            <option value="easy">Fácil</option>
                            <option value="medium">Médio</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </div>
                )}
                <Button type="submit" className="mt-6">Iniciar partida</Button>
            </form>
        </div>
    );
}
