// Porta de entrada da engine.
// Interface e IA importam somente deste arquivo, nunca dos arquivos internos.

export type { Square, Color, PieceType, Piece, Board, Move, GameState } from './types';
export { sameSquare, isInside, containsSquare } from './board/square';
export { getPiece } from './board/board';
export { createGame } from './game/createGame';
export { getAvailablePieces } from './board/availablePieces';
export { getLegalMoves } from './moves/legalMoves';
export { applyMove } from './game/applyMove';
