import type { GameState, Move } from '../types';
import { movePiece } from '../board/movePiece';
import { getPiece } from '../board/board';

// Aplica a jogada e devolve um estado novo: peca movida, turno trocado,
// numero do lance atualizado e peca capturada guardada (se houver).
// O estado recebido nao e alterado.
// Os outros campos (roque, en passant, contador dos 50 lances, promocao)
// ainda passam sem mudanca e serao atualizados nas issues de cada um.
export function applyMove(state: GameState, move: Move): GameState {
  const nextTurn = state.turn === 'w' ? 'b' : 'w';

  // O numero do lance aumenta depois que as pretas jogam
  const fullmoveNumber = state.turn === 'b'
    ? state.internal.fullmoveNumber + 1
    : state.internal.fullmoveNumber;

  // A peca no destino, olhada antes de mover, e a peca capturada
  const target = getPiece(state.board, move.to);
  const captured = target === null ? state.captured : [...state.captured, target];

  return {
    ...state,
    board: movePiece(state.board, move),
    turn: nextTurn,
    captured,
    internal: {
      ...state.internal,
      fullmoveNumber,
    },
  };
}
