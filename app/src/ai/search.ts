import type { GameState, Move } from '../engine';
import { applyMove } from '../engine';
import { evaluate, isKingMissing } from './evaluation';
import { generateMoves } from './moveGeneration';

// Minimax com poda alpha-beta. Brancas maximizam e pretas minimizam.
// alpha = melhor valor ja garantido para as brancas
// beta  = melhor valor ja garantido para as pretas
export function alphaBeta(state: GameState, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || isKingMissing(state.board)) {
    return evaluate(state);
  }

  const moves = generateMoves(state);
  if (moves.length === 0) {
    // Sem lances: depois da #27 aqui sera xeque-mate ou afogamento
    return evaluate(state);
  }

  if (state.turn === 'w') {
    let best = -Infinity;
    for (const move of moves) {
      best = Math.max(best, alphaBeta(applyMove(state, move), depth - 1, alpha, beta));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) {
        break; // as pretas nunca deixariam chegar aqui
      }
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    best = Math.min(best, alphaBeta(applyMove(state, move), depth - 1, alpha, beta));
    beta = Math.min(beta, best);
    if (alpha >= beta) {
      break; // as brancas nunca deixariam chegar aqui
    }
  }
  return best;
}

// Testa cada lance da raiz e devolve o melhor para quem esta jogando.
export function findBestMove(state: GameState, depth: number): Move | null {
  const white = state.turn === 'w';
  let bestMove: Move | null = null;
  let bestScore = white ? -Infinity : Infinity;

  for (const move of generateMoves(state)) {
    const score = alphaBeta(applyMove(state, move), depth - 1, -Infinity, Infinity);
    if (white ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
