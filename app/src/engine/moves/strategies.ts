import type { PieceType } from '../types';
import type { PieceStrategy } from '../pieces/pieces';
import { PawnStrategy } from '../pieces/pawn';
import { KnightStrategy } from '../pieces/knight';
import { BishopStrategy } from '../pieces/bishop';
import { RookStrategy } from '../pieces/rook';
import { QueenStrategy } from '../pieces/queen';
import { KingStrategy } from '../pieces/king';

// Contexto do padrao Strategy: liga cada tipo de peca a sua estrategia.
// Quem gera os lances olha o tipo da peca e usa a estrategia daqui.
export const PIECE_STRATEGIES: Record<PieceType, PieceStrategy> = {
  p: new PawnStrategy(),
  n: new KnightStrategy(),
  b: new BishopStrategy(),
  r: new RookStrategy(),
  q: new QueenStrategy(),
  k: new KingStrategy(),
};
