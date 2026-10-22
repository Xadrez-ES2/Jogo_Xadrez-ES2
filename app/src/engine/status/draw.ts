import type { Board, GameState } from '../types';
import { getAvailablePieces } from '../board/availablePieces';

// Empate pela regra dos 50 lances (automatico).
// O contador soma 1 a cada meio-lance e zera em lance de peao ou captura.
// 50 lances de cada lado = 100 meio-lances.
export function isFiftyMoveDraw(state: GameState): boolean {
  return state.internal.halfmoveClock >= 100;
}


// Empate por falta de pecas: nenhum dos lados consegue dar xeque-mate.
// Casos: rei contra rei, rei e bispo contra rei, rei e cavalo contra rei,
// e rei e bispo contra rei e bispo com os bispos em casas da mesma cor.
export function isInsufficientMaterial(board: Board): boolean {
  const white = getAvailablePieces(board, 'w').filter((p) => p.piece.type !== 'k');
  const black = getAvailablePieces(board, 'b').filter((p) => p.piece.type !== 'k');
  const others = [...white, ...black];

  if (others.length === 0) {
    return true;
  }
  if (others.length === 1) {
    return others[0].piece.type === 'b' || others[0].piece.type === 'n';
  }
  if (white.length === 1 && black.length === 1
    && white[0].piece.type === 'b' && black[0].piece.type === 'b') {
    // A cor da casa e dada pela paridade de linha + coluna
    const whiteColor = (white[0].square[0] + white[0].square[1]) % 2;
    const blackColor = (black[0].square[0] + black[0].square[1]) % 2;
    return whiteColor === blackColor;
  }
  return false;
}
