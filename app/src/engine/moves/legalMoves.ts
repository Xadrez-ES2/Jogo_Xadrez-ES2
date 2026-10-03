import type { GameState, Move } from '../types';
import { PIECE_STRATEGIES } from './strategies';

// Retorna os lances do jogador da vez, usando a estrategia de cada peca.
// Por enquanto ainda nao descarta os lances que deixam o proprio rei em xeque:
// esse filtro sera adicionado na issue #27.
// Roque e en passant tambem ainda nao estao incluidos.
export function getLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece === null || piece.color !== state.turn) {
        continue;
      }
      const strategy = PIECE_STRATEGIES[piece.type];
      for (const to of strategy.moves(state.board, [row, col])) {
        moves.push({ from: [row, col], to });
      }
    }
  }
  return moves;
}
