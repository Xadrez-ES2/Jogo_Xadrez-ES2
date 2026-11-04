import type { GameState } from '../types';
import { getLegalMoves } from '../moves/legalMoves';

// Somente uma captura en passant LEGAL diferencia duas posicoes.
// Um alvo sem peao capturador, ou com captura que expoe o rei, e ignorado.
function legalEnPassantTarget(state: GameState): string {
  const target = state.internal.enPassant;
  if (!target || state.board[target[0]][target[1]] !== null) return '-';
  const canCapture = getLegalMoves(state).some((move) =>
    state.board[move.from[0]][move.from[1]]?.type === 'p'
    && move.from[1] !== move.to[1]
    && move.to[0] === target[0] && move.to[1] === target[1]);
  return canCapture ? target.join(',') : '-';
}

// Identidade da posicao (FIDE 9.2.3): pecas, turno, direitos de roque
// e en passant legal. Contadores de lances nao fazem parte da identidade.
export function getPositionKey(state: GameState): string {
  const pieces = state.board.map((row) => row.map((piece) =>
    piece ? piece.color + piece.type : '--').join('')).join('/');
  const rights = state.internal.castling;
  const castling = [rights.whiteKingSide, rights.whiteQueenSide,
    rights.blackKingSide, rights.blackQueenSide].map(Number).join('');
  return `${pieces} ${state.turn} ${castling} ${legalEnPassantTarget(state)}`;
}

// Acrescenta uma posicao sem modificar o estado nem o historico anterior.
// A promocao so completa o lance depois da escolha da nova peca.
export function recordPosition(state: GameState): GameState {
  if (state.pendingPromotion) return state;
  return {
    ...state,
    internal: {
      ...state.internal,
      positionHistory: [...(state.internal.positionHistory ?? []), getPositionKey(state)],
    },
  };
}
