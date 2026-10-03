import type { PieceType } from '../engine';

// Criterios usados pela funcao de avaliacao.
// Os valores sao em centipeoes (100 = um peao).

// Peso: quanto vale cada peca.
export const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000, //ainda não tem xeque disponível ainda na máquina de regras (engine)
};

// Controle do centro: bonus por casa ocupada (vale para peao, cavalo e bispo).
//Posições do meio valem mais por conta do maior alcance de posiç~oes
export const CENTER_BONUS: readonly (readonly number[])[] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 5, 10, 10, 10, 10, 5, 0],
  [0, 5, 10, 20, 20, 10, 5, 0],
  [0, 5, 10, 20, 20, 10, 5, 0],
  [0, 5, 10, 10, 10, 10, 5, 0],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

// Avanco do peao: bonus por cada casa que ele andou desde a linha inicial.
// Beneficia a promoção de peão
export const PAWN_ADVANCE_BONUS = 5;
