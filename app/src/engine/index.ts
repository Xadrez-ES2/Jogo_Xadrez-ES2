// Porta de entrada da engine.
// Interface e IA importam somente deste arquivo, nunca dos arquivos internos.

export type { Square, Color, PieceType, Piece, Board, Move, GameState, GameStatus } from './types';
export { sameSquare, isInside, containsSquare } from './board/square';
export { getPiece, findKing } from './board/board';
export { createGame } from './game/createGame';
export { getAvailablePieces } from './board/availablePieces';
export { getLegalMoves } from './moves/legalMoves';
export { applyMove } from './game/applyMove';
export { getGameStatus } from './status/gameStatus';
