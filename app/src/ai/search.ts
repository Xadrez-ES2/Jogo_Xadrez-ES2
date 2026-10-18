import type { GameState, Move } from '../engine';
import { applyMove, getGameStatus, isFiftyMoveDraw, promotePawn } from '../engine';
import { evaluate } from './evaluation';
import { generateMoves } from './moveGeneration';

const CHECKMATE_SCORE = 100_000;

function terminalScore(state: GameState, ply: number): number {
  // O jogador da vez perdeu quando a partida esta em xeque-mate.
  return state.turn === 'w' ? -CHECKMATE_SCORE + ply : CHECKMATE_SCORE - ply;
}

function applySearchMove(state: GameState, move: Move): GameState {
  const next = applyMove(state, move);
  const movingPiece = state.board[move.from[0]][move.from[1]];
  return movingPiece?.type === 'p' && (move.to[0] === 0 || move.to[0] === 7)
    ? promotePawn(next, 'q')
    : next;
}

// Minimax com poda alpha-beta. Brancas maximizam e pretas minimizam.
// alpha = melhor valor ja garantido para as brancas
// beta  = melhor valor ja garantido para as pretas
export function alphaBeta(state: GameState, depth: number, alpha: number, beta: number, ply = 0): number {
  const moves = generateMoves(state);
  if (moves.length === 0) {
    return getGameStatus(state) === 'checkmate' ? terminalScore(state, ply) : 0;
  }
  if (depth === 0) {
    return isFiftyMoveDraw(state) ? 0 : evaluate(state);
  }

  if (state.turn === 'w') {
    let best = -Infinity;
    for (const move of moves) {
      best = Math.max(best, alphaBeta(applySearchMove(state, move), depth - 1, alpha, beta, ply + 1));
      alpha = Math.max(alpha, best);
      if (alpha >= beta) {
        break; // as pretas nunca deixariam chegar aqui
      }
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    best = Math.min(best, alphaBeta(applySearchMove(state, move), depth - 1, alpha, beta, ply + 1));
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
  let bestScore = white ? -Infinity : Infinity;
  const bestMoves: Move[] = [];

  for (const move of generateMoves(state)) {
    const score = alphaBeta(applySearchMove(state, move), depth - 1, -Infinity, Infinity, 1);
    if (white ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMoves.length = 0;
      bestMoves.push(move);
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? null;
}
