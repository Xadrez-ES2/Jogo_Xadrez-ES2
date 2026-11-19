import type { Difficulty } from "./matchHistory";

export type GameMode = "human-ai" | "human-human" | "ai-ai";

export type TimeControlOption = "10min" | "5min" | "2min" | "1min" | "none";

export type PlayerColorChoice = "white" | "black" | "random";

export interface GameSetup {
    mode: GameMode;
    difficulty: Exclude<Difficulty, "not-set">;
    /* Tempo de cada jogador em milissegundos. `null` indica sem limite de tempo. */
    timeLimitMs?: number | null;
    timeOption?: TimeControlOption;
    /* Cor escolhida pelo jogador (apenas relevante em human-ai). */
    playerColor?: PlayerColorChoice;
}

export const gameModeLabels: Record<GameMode, string> = {
    "human-ai": "Pessoa vs. IA",
    "human-human": "Pessoa vs. Pessoa (Local)",
    "ai-ai": "IA vs. IA",
};

export const TIME_PRESETS_MS = {
    "10min": 10 * 60 * 1000,
    "5min": 5 * 60 * 1000,
    "2min": 2 * 60 * 1000,
    "1min": 1 * 60 * 1000,
} as const;
