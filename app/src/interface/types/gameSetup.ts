import type { Difficulty } from "./matchHistory";

export type GameMode = "human-ai" | "human-human" | "ai-ai";
export interface GameSetup {
    mode: GameMode;
    difficulty: Exclude<Difficulty, "not-set">;
}
export const gameModeLabels: Record<GameMode, string> = {
    "human-ai": "Pessoa vs IA",
    "human-human": "Pessoa vs pessoa",
    "ai-ai": "IA vs IA",
};
