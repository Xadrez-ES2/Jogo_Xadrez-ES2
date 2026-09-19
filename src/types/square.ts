import type { PlayablePiece } from "./pieces";

/*
    Coordenadas do tabuleiro em notação algébrica (colunas 'a'-'h',
    linhas 1-8).
    
    Usar tipos literais em vez de `string`/`number` soltos
    ajuda o TypeScript a barrar coordenadas inválidas (ex: 'i9') já
    na hora de escrever a engine, não só em runtime.
*/
export type Files = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type Ranks = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Identificador de casa, ex: "e4".
export type SquareId = `${Files}${Ranks}`;

/*
    Estado do tabuleiro como um mapa esparso: só as casas ocupadas
    aparecem como chave. Uma casa vazia simplesmente não existe no objeto,
    em vez de precisar de um valor `null` explícito em 64 posições.
*/
export type BoardState = Partial<Record<SquareId, PlayablePiece>>;

// Um lance já efetuado — casa de origem e destino, em notação algébrica.
export interface Move {
  from: SquareId;
  to: SquareId;
}