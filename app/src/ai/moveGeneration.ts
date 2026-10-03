import type { GameState, Move } from '../engine';
import { getLegalMoves, getPiece } from '../engine';
import { PIECE_VALUES } from './criteria';

// Valor da peca capturada pelo lance, ou 0 se nao for captura.
function captureValue(state: GameState, move: Move): number {
  const target = getPiece(state.board, move.to);
  return target === null ? 0 : PIECE_VALUES[target.type];
}


export function generateMoves(state: GameState): Move[] {
  const moves = getLegalMoves(state); 
  return moves.sort((a, b) => captureValue(state, b) - captureValue(state, a)); // Organiza em ordem decrescente

}
