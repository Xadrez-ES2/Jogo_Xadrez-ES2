import type { Piece, PlayablePiece } from "../../types/pieces";

import whiteKing from "../../assets/pieces/white-king.png";
import whiteQueen from "../../assets/pieces/white-queen.png";
import whiteRook from "../../assets/pieces/white-rook.png";
import whiteBishop from "../../assets/pieces/white-bishop.png";
import whiteKnight from "../../assets/pieces/white-knight.png";
import whitePawn from "../../assets/pieces/white-pawn.png";

import blackKing from "../../assets/pieces/black-king.png";
import blackQueen from "../../assets/pieces/black-queen.png";
import blackRook from "../../assets/pieces/black-rook.png";
import blackBishop from "../../assets/pieces/black-bishop.png";
import blackKnight from "../../assets/pieces/black-knight.png";
import blackPawn from "../../assets/pieces/black-pawn.png";

const PLAYABLE_PIECE_IMAGES: Record<
    PlayablePiece["color"],
    Record<Piece["type"], string>
> = {
    white: {
        king: whiteKing,
        queen: whiteQueen,
        rook: whiteRook,
        bishop: whiteBishop,
        knight: whiteKnight,
        pawn: whitePawn,
    },
    black: {
        king: blackKing,
        queen: blackQueen,
        rook: blackRook,
        bishop: blackBishop,
        knight: blackKnight,
        pawn: blackPawn,
    },
};

const PlayablePiece_NAMES_PT: Record<Piece["type"], string> = {
    king: "rei",
    queen: "dama",
    rook: "torre",
    bishop: "bispo",
    knight: "cavalo",
    pawn: "peão",
};

export function getPlayablePieceAccessibleLabel(
    playablePiece: PlayablePiece
): string {
    const colorLabel =
        playablePiece.color === "white" ? "peça branca" : "peça preta";

    return `${colorLabel}: ${PlayablePiece_NAMES_PT[playablePiece.piece.type]}`;
}

export function PieceGlyph({
    playablePiece,
}: {
    playablePiece: PlayablePiece;
}) {
    const image =
        PLAYABLE_PIECE_IMAGES[playablePiece.color][
            playablePiece.piece.type
        ];

    return (
        <img
            src={image}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none select-none w-12 h-12 z-10 object-contain sm:w-15 sm:h-15"
        />
    );
}