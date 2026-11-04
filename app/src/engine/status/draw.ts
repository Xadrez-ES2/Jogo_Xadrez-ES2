import type { GameState } from '../types';
import { getPositionKey } from './repetition';

// Empate pela regra dos 50 lances (automatico).
// O contador soma 1 a cada meio-lance e zera em lance de peao ou captura.
// 50 lances de cada lado = 100 meio-lances.
export function isFiftyMoveDraw(state: GameState): boolean {
  return state.internal.halfmoveClock >= 100;
}

// Empate na terceira ocorrencia da posicao atual, seguindo a convencao
// automatica ja usada pela engine para a regra dos 50 lances.
// Sem historico nao e possivel reconstruir repeticoes anteriores.
export function isThreefoldRepetition(state: GameState): boolean {
  if (state.pendingPromotion) return false;
  const key = getPositionKey(state);
  let occurrences = 0;
  for (const position of state.internal.positionHistory ?? []) {
    if (position === key && ++occurrences >= 3) return true;
  }
  return false;
}

