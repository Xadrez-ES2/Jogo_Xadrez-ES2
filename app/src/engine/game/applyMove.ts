import type { GameState, Move } from '../types';
import { movePiece } from '../board/movePiece';

// Aplica a jogada e devolve um estado novo: peca movida, turno trocado
// e numero do lance atualizado. O estado recebido nao e alterado.
// Os outros campos (roque, en passant, contador dos 50 lances, promocao)
// ainda passam sem mudanca e serao atualizados nas issues de cada um.
export function applyMove(state: GameState, move: Move): GameState {
  const nextTurn = state.turn === 'w' ? 'b' : 'w';

  // O numero do lance aumenta depois que as pretas jogam
  const fullmoveNumber = state.turn === 'b'
    ? state.internal.fullmoveNumber + 1
    : state.internal.fullmoveNumber;

  return {
    ...state,
    board: movePiece(state.board, move),
    turn: nextTurn,
    internal: {
      ...state.internal,
      fullmoveNumber,
    },
  };
}
