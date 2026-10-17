// Porta de entrada da IA. A interface importa somente deste arquivo.
import type { GameState, Move } from '../engine';
import { DIFFICULTY_PARAMS } from './difficulty';
import type { Difficulty } from './difficulty';
import { findBestMove } from './search';
import { generateMoves } from './moveGeneration';

export type { Difficulty } from './difficulty';

// Escolhe o lance do computador para o jogador da vez.
// Devolve null se nao houver lance possivel.
export function chooseMove(state: GameState, level: Difficulty): Move | null {
  const params = DIFFICULTY_PARAMS[level];

  if (Math.random() < params.randomChance) {
    const moves = generateMoves(state);
    if (moves.length > 0) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
  }
  return findBestMove(state, params.depth);
}
