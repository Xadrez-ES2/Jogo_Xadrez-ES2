import { useLayoutEffect, useRef } from "react";
import type { PieceColor, PlayablePiece } from "../../types/pieces";
import type { Files, Ranks, SquareId } from "../../types/square";
import { PieceGlyph } from "./PieceGlyph";

const BASE_FILES: Files[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

function getSquareCoords(squareId: SquareId, orientation: PieceColor) {
    const file = squareId[0] as Files;
    const rank = Number(squareId.slice(1)) as Ranks;
    const fileIndex = BASE_FILES.indexOf(file);

    const col = orientation === "black" ? 7 - fileIndex : fileIndex;
    const row = orientation === "black" ? rank - 1 : 8 - rank;

    return { col, row };
}

export interface PieceAnimation {
    id: string;
    from: SquareId;
    to: SquareId;
    piece: PlayablePiece;
}

interface AnimatedPieceLayerProps {
    animation: PieceAnimation | undefined;
    orientation?: PieceColor;
    onAnimationEnd: () => void;
}

/*
    Renderiza a peça em movimento suave entre a casa de origem e destino.
    Utiliza porcentagens para posicionamento exato no grid 8x8 e a Web Animations API
    para garantir início imediato no frame 0 (sem atrasos de renderização ou peças duplicadas).
    Protegido contra loops de re-render (ex: ticks periódicos do relógio).
*/
export function AnimatedPieceLayer({
    animation,
    orientation = "white",
    onAnimationEnd,
}: AnimatedPieceLayerProps) {
    
    const pieceRef = useRef<HTMLDivElement>(null);
    const activeAnimationRef = useRef<Animation | null>(null);
    const playedIdRef = useRef<string | null>(null);
    const onAnimationEndRef = useRef(onAnimationEnd);
    onAnimationEndRef.current = onAnimationEnd;

    const animationId = animation?.id;
    const fromSquare = animation?.from;
    const toSquare = animation?.to;

    useLayoutEffect(() => {
        const el = pieceRef.current;
        if (!el || !animationId || !fromSquare || !toSquare) {
            if (activeAnimationRef.current) {
                activeAnimationRef.current.cancel();
                activeAnimationRef.current = null;
            }
            playedIdRef.current = null;
            return;
        }

        // Se a animação deste lance específico já foi disparada, não reinicie em re-renders do componente pai
        if (playedIdRef.current === animationId) {
            return;
        }
        playedIdRef.current = animationId;

        const fromCoords = getSquareCoords(fromSquare, orientation);
        const toCoords = getSquareCoords(toSquare, orientation);
        const dx = (fromCoords.col - toCoords.col) * 100;
        const dy = (fromCoords.row - toCoords.row) * 100;

        let finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            activeAnimationRef.current = null;
            onAnimationEndRef.current();
        }

        if (typeof el.animate === "function") {
            const anim = el.animate(
                [
                    { transform: `translate3d(${dx}%, ${dy}%, 0)` },
                    { transform: "translate3d(0%, 0%, 0)" },
                ],
                {
                    duration: 200,
                    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                    fill: "forwards",
                }
            );

            activeAnimationRef.current = anim;
            anim.onfinish = finish;

            // Timer de segurança caso a aba fique em segundo plano ou o ciclo de render atrase
            const safetyTimer = window.setTimeout(finish, 250);

            return () => {
                window.clearTimeout(safetyTimer);
            };
        } else {
            finish();
        }
    }, [animationId, fromSquare, toSquare, orientation]);

    if (!animation) return null;

    const toCoords = getSquareCoords(animation.to, orientation);

    return (
        <div
            ref={pieceRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-40 flex aspect-square items-center justify-center"
            style={{
                left: `${toCoords.col * 12.5}%`,
                top: `${toCoords.row * 12.5}%`,
                width: "12.5%",
                height: "12.5%",
            }}
        >
            <PieceGlyph playablePiece={animation.piece} />
        </div>
    );
}
