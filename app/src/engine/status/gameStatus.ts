import type { GameState, GameStatus } from '../types';
import { getLegalMoves } from '../moves/legalMoves';
import { isInCheck } from './attack';
import { isFiftyMoveDraw, isInsufficientMaterial } from './draw';

// Retorna a situacao da partida para o jogador da vez.
// Sem lances e com o rei atacado e xeque-mate: o vencedor e quem jogou por ultimo.
// O xeque-mate vem antes do empate: se o lance que completa os 50 lances
// der mate, vale o mate.
export function getGameStatus(state: GameState): GameStatus {
  const inCheck = isInCheck(state.board, state.turn);
  const hasMoves = getLegalMoves(state).length > 0;

  if (!hasMoves) {
    return inCheck ? 'checkmate' : 'stalemate';
  }
  if (isFiftyMoveDraw(state)) {
    return 'fifty-moves';
  }
  if (isInsufficientMaterial(state.board)) {
    return 'insufficient-material';
  }
  if (inCheck) {
    return 'check';
  }
  return 'playing';
}
