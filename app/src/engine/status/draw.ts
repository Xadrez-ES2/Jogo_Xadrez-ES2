import type { Board, GameState } from '../types';
import { getAvailablePieces } from '../board/availablePieces';
import { getPositionKey } from './repetition';

// Empate pela regra dos 50 lances (automatico).
// O contador soma 1 a cada meio-lance e zera em lance de peao ou captura.
// 50 lances de cada lado = 100 meio-lances.
export function isFiftyMoveDraw(state: GameState): boolean {
  return state.internal.halfmoveClock >= 100;
}


// Empate por falta de pecas: nenhum dos lados consegue dar xeque-mate.
// Casos: rei contra rei, rei e bispo contra rei, rei e cavalo contra rei,
// e posicoes com apenas reis e bispos que atuam na mesma cor de casas,
// inclusive varios bispos da mesma cor obtidos por promocao.
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
  if (others.every((p) => p.piece.type === 'b')) {
    // A quantidade e a cor das pecas nao importam: todos os bispos
    // precisam estar restritos a mesma cor de casas.
    const squareColor = (others[0].square[0] + others[0].square[1]) % 2;
    return others.every((p) => (p.square[0] + p.square[1]) % 2 === squareColor);
  }
  return false;
}

// Empate na terceira ocorrencia da posicao atual, seguindo a convencao
// automatica ja usada pela engine para a regra dos 50 lances.
export function isThreefoldRepetition(state: GameState): boolean {
  if (state.pendingPromotion) return false;
  const key = getPositionKey(state);
  let occurrences = 0;
  for (const position of state.internal.positionHistory ?? []) {
    if (position === key && ++occurrences >= 3) return true;
  }
  return false;
}

