import type { GameResult } from "./gameResult";

export type Difficulty = "easy" | "medium" | "hard" | "not-set";
export type EndReason = "resignation" | "timeout" | "checkmate" | "draw";

export interface MatchRecord {
    id: string;
    ownerUid: string;
    endedAt: number;
    outcome: GameResult["outcome"];
    reason: string;
    reasonCode: EndReason;
    difficulty: Difficulty;
    opponent: string;
}

export interface MatchHistoryService {
    configured: boolean;
    subscribe: (uid: string, onRecords: (records: MatchRecord[]) => void, onError: (error: unknown) => void) => () => void;
    save: (record: MatchRecord) => Promise<void>;
}

export const difficultyLabels: Record<Difficulty, string> = {
    easy: "Fácil", medium: "Médio", hard: "Difícil", "not-set": "Não definida",
};
