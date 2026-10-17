import type { GameState, Move } from '../types';
import { movePiece } from '../board/movePiece';
import { getPiece } from '../board/board';

// Aplica a jogada e devolve um estado novo: peca movida, turno trocado,
// numero do lance e contador dos 50 lances atualizados.
// O estado recebido nao e alterado.
// Os outros campos (roque, en passant, promocao) ainda passam sem mudanca
// e serao atualizados nas issues de cada um.
import type { Board, Color } from '../types';

function applyBoardMove(state: GameState, move: Move): Board {
  const piece = state.board[move.from[0]][move.from[1]];
  let board = movePiece(state.board, move);
  if (piece?.type === 'p' && state.internal.enPassant
    && move.to[0] === state.internal.enPassant[0] && move.to[1] === state.internal.enPassant[1]
    && move.from[1] !== move.to[1] && state.board[move.to[0]][move.to[1]] === null) {
    const capturedRow = move.to[0] + (piece.color === 'w' ? 1 : -1);
    const mutable = board.map((row) => [...row]);
    mutable[capturedRow][move.to[1]] = null;
    board = mutable;
  }
  if (piece?.type === 'k' && Math.abs(move.to[1] - move.from[1]) === 2) {
    const row = move.from[0];
    const rookFrom = move.to[1] > move.from[1] ? 7 : 0;
    const rookTo = move.to[1] > move.from[1] ? 5 : 3;
    board = movePiece(board, { from: [row, rookFrom], to: [row, rookTo] });
  }
  return board;
}

function nextEnPassantSquare(state: GameState, move: Move) {
  const piece = state.board[move.from[0]][move.from[1]];
  if (piece?.type !== 'p' || Math.abs(move.to[0] - move.from[0]) !== 2) return null;
  return [(move.from[0] + move.to[0]) / 2, move.from[1]] as const;
}

function updateCastlingRights(state: GameState, move: Move) {
  const rights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  } = { ...state.internal.castling };
  const moving = state.board[move.from[0]][move.from[1]];
  const captured = state.board[move.to[0]][move.to[1]];
  const revokeRookRight = (color: Color, row: number, col: number) => {
    if (color === 'w' && row === 7 && col === 0) rights.whiteQueenSide = false;
    if (color === 'w' && row === 7 && col === 7) rights.whiteKingSide = false;
    if (color === 'b' && row === 0 && col === 0) rights.blackQueenSide = false;
    if (color === 'b' && row === 0 && col === 7) rights.blackKingSide = false;
  };
  if (moving?.type === 'k') {
    if (moving.color === 'w') rights.whiteKingSide = rights.whiteQueenSide = false;
    else rights.blackKingSide = rights.blackQueenSide = false;
  }
  if (moving?.type === 'r') revokeRookRight(moving.color, move.from[0], move.from[1]);
  if (captured?.type === 'r') revokeRookRight(captured.color, move.to[0], move.to[1]);
  return rights;
}

// Aplica a jogada e devolve um estado novo: peca movida, turno trocado
// e numero do lance atualizado. O estado recebido nao e alterado.
export function applyMove(state: GameState, move: Move): GameState {
  const movingPiece = state.board[move.from[0]][move.from[1]];
  const isPromotion = movingPiece?.type === 'p' && (move.to[0] === 0 || move.to[0] === 7);
  const nextTurn = isPromotion ? state.turn : state.turn === 'w' ? 'b' : 'w';

  // O numero do lance aumenta depois que as pretas jogam
  const fullmoveNumber = !isPromotion && state.turn === 'b'
    ? state.internal.fullmoveNumber + 1
    : state.internal.fullmoveNumber;

  // Contador dos 50 lances: zera em lance de peao ou captura, senao soma 1
  const isPawnMove = getPiece(state.board, move.from)?.type === 'p';
  const isCapture = getPiece(state.board, move.to) !== null;
  const halfmoveClock = isPawnMove || isCapture ? 0 : state.internal.halfmoveClock + 1;

  return {
    ...state,
    board: applyBoardMove(state, move),
    turn: nextTurn,
    pendingPromotion: isPromotion ? move.to : null,
    internal: {
      ...state.internal,
      halfmoveClock,
      castling: updateCastlingRights(state, move),
      enPassant: nextEnPassantSquare(state, move),
      fullmoveNumber,
    },
  };
}

export function promotePawn(state: GameState, type: import('../types').PromotionPieceType): GameState {
  const square = state.pendingPromotion;
  if (!square) return state;
  const pawn = state.board[square[0]][square[1]];
  if (pawn?.type !== 'p' || pawn.color !== state.turn) return state;
  const board = state.board.map((row) => [...row]);
  board[square[0]][square[1]] = { type, color: pawn.color };
  return {
    ...state,
    board,
    turn: state.turn === 'w' ? 'b' : 'w',
    pendingPromotion: null,
    internal: {
      ...state.internal,
      fullmoveNumber: state.turn === 'b' ? state.internal.fullmoveNumber + 1 : state.internal.fullmoveNumber,
    },
  };
}
