// Resultado apresentado pela interface; a detecção pelas regras será integrada depois.
export interface GameResult {
    outcome: "victory" | "defeat" | "draw";
    reason: string;
}

export const resultTitles: Record<GameResult["outcome"], string> = {
    victory: "Vitória",
    defeat: "Derrota",
    draw: "Empate",
};
