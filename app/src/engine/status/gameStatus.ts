import type { GameState, GameStatus } from '../types';
import { getLegalMoves } from '../moves/legalMoves';
import { isInCheck } from './attack';

// Retorna a situacao da partida para o jogador da vez.
// Sem lances e com o rei atacado e xeque-mate: o vencedor e quem jogou por ultimo.
// Sem lances e sem xeque (afogamento) ainda devolve 'playing':
// o empate sera tratado na issue de empate por afogamento.
export function getGameStatus(state: GameState): GameStatus {
  const inCheck = isInCheck(state.board, state.turn);
  const hasMoves = getLegalMoves(state).length > 0;

  if (inCheck && !hasMoves) {
    return 'checkmate';
  }
  if (inCheck) {
    return 'check';
  }
  return 'playing';
}
