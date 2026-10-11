import type { GameState } from '../types';

// Empate pela regra dos 50 lances (automatico).
// O contador soma 1 a cada meio-lance e zera em lance de peao ou captura.
// 50 lances de cada lado = 100 meio-lances.
export function isFiftyMoveDraw(state: GameState): boolean {
  return state.internal.halfmoveClock >= 100;
}
