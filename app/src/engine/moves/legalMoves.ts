import type { Board, Color, GameState, Move } from '../types';
import { PIECE_STRATEGIES } from './strategies';
import { movePiece } from '../board/movePiece';
import { isInCheck } from '../status/attack';

// Gera os lances pseudo-legais da cor: respeitam o movimento de cada peca,
// mas ainda podem deixar o proprio rei atacado.
function pseudoLegalMoves(board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === null || piece.color !== color) {
        continue;
      }
      const strategy = PIECE_STRATEGIES[piece.type];
      for (const to of strategy.moves(board, [row, col])) {
        moves.push({ from: [row, col], to });
      }
    }
  }
  return moves;
}

// Retorna as jogadas legais do jogador da vez: os lances pseudo-legais
// que, depois de simulados, nao deixam o proprio rei atacado.
export function getLegalMoves(state: GameState): Move[] {
  const color = state.turn;
  return pseudoLegalMoves(state.board, color).filter(
    (move) => !isInCheck(movePiece(state.board, move), color),
  );
}
