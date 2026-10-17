export type Difficulty = 'easy' | 'medium' | 'hard';

// depth: quantos lances (meio-lances) a busca olha para frente
// randomChance: chance de jogar um lance aleatorio no lugar do melhor
export type DifficultyParams = {
  readonly depth: number;
  readonly randomChance: number;
};

export const DIFFICULTY_PARAMS: Record<Difficulty, DifficultyParams> = {
  easy: { depth: 1, randomChance: 0.3 },
  medium: { depth: 2, randomChance: 0.1 },
  hard: { depth: 3, randomChance: 0 },
};
