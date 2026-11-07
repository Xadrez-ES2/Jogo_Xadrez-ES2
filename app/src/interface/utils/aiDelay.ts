import type { Difficulty } from "../../ai";

// Faixa de tempo que a IA "pensa" em cada nivel, em ms
const THINK_RANGE_MS: Record<Difficulty, [number, number]> = {
	easy: [600, 1_800],
	medium: [1_000, 3_000],
	hard: [1_500, 4_500],
};

// Sorteia quanto tempo a IA demora para jogar, como uma pessoa faria:
// lance forcado e rapido, abertura e mais rapida, o resto varia dentro da faixa.
// plies = meio-lances ja jogados; legalMoves = quantos lances a IA tem
export function aiThinkTime(level: Difficulty, plies: number, legalMoves: number, random = Math.random()): number {
	if (legalMoves === 1) return 400;
	const [min, max] = THINK_RANGE_MS[level];
	const time = min + random * (max - min);
	return plies < 10 ? time / 2 : time;
}
