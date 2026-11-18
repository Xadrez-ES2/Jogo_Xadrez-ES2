
import type { PieceType } from "../types/pieces";

/*
    Funções auxiliares para o projeto
*/

/*
    Iniciais usadas como fallback visual se o Jogador/Player não tem avatar
*/
export function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

/*
    Ordem padrão das peças capturadas (por valor crescente: peão, cavalo, bispo, torre, dama, rei).
*/
export const CAPTURED_PIECES_ORDER: Record<PieceType, number> = {
    pawn: 1,
    knight: 2,
    bishop: 3,
    rook: 4,
    queen: 5,
    king: 6,
};

/*
    Ordena uma lista de peças capturadas pela hierarquia de valor de xadrez.
*/
export function sortCapturedPieces(pieces: PieceType[]): PieceType[] {
    return [...pieces].sort(
        (a, b) => (CAPTURED_PIECES_ORDER[a] ?? 99) - (CAPTURED_PIECES_ORDER[b] ?? 99)
    );
}
