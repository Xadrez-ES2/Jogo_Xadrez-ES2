import { useCallback, useState } from "react";
import type { GameState } from "../../engine";
import { toBoardState, type PlayedMove } from "./useGameMoves";
import type { BoardState } from "../types/square";

/**
    Gerencia a navegação pelo histórico da partida sem alterar o estado real do jogo.

    - `viewIndex === null` → modo ao vivo (tabuleiro mostra o estado atual)
    - `viewIndex === 0`    → posição inicial (antes do primeiro lance)
    - `viewIndex === i`    → posição após o i-ésimo lance (1-based)

    `snapshots[0]`   = estado inicial da partida
    `snapshots[i]`   = estado após history[i-1]
*/
export function useHistoryNavigation(snapshots: GameState[], history: PlayedMove[]) {
    const [viewIndex, setViewIndex] = useState<number | null>(null);

    /* Número de lances realizados (igual a `history.length`). */
    const totalPlies = history.length;

    /*
        Índice efetivo para leitura: se ao vivo, aponta para o último snapshot.
        Snapshots indexados de 0 (início) a totalPlies (lance mais recente).
    */
    const effectiveIndex: number = viewIndex ?? totalPlies;

    /* Estado do jogo no ponto visualizado. */
    const viewGame: GameState | undefined = snapshots[effectiveIndex];

    /* BoardState derivado do ponto visualizado. */
    const viewPieces: BoardState | undefined = viewGame ? toBoardState(viewGame) : undefined;

    /* Lance em foco na lista (para destaque no painel). null = ao vivo (sem destaque extra). */
    const focusedMoveIndex: number | null = viewIndex === null ? null : viewIndex - 1;

    /* Último lance do ponto visualizado (para highlight nas casas). */
    const viewLastMove = viewIndex === null
        ? history.at(-1)
        : viewIndex > 0 ? history[viewIndex - 1] : undefined;

    /* Vai ao ponto inicial da partida. */
    const goToStart = useCallback(() => {
        if (totalPlies === 0) return;
        setViewIndex(0);
    }, [totalPlies]);

    /* Recua um lance. Se já no início, permanece. */
    const goBack = useCallback(() => {
        if (totalPlies === 0) return;
        setViewIndex((prev) => {
            const current = prev ?? totalPlies;
            return Math.max(0, current - 1);
        });
    }, [totalPlies]);

    /* Avança um lance. Se já no fim, retorna ao modo ao vivo. */
    const goForward = useCallback(() => {
        if (totalPlies === 0) return;
        setViewIndex((prev) => {
            const current = prev ?? totalPlies;
            const next = current + 1;
            if (next >= totalPlies) return null; // volta ao vivo
            return next;
        });
    }, [totalPlies]);

    /* Vai ao lance mais recente (modo ao vivo). */
    const goToEnd = useCallback(() => setViewIndex(null), []);

    /*
        Navega para um índice específico (0 = início, i = após lance i).
        Se `index >= totalPlies`, retorna ao modo ao vivo.
    */
    const navigateTo = useCallback((index: number) => {
        if (index >= totalPlies) {
            setViewIndex(null);
        } else {
            setViewIndex(index);
        }
    }, [totalPlies]);

    /* Retorna ao modo ao vivo (igual a goToEnd). */
    const returnToLive = useCallback(() => setViewIndex(null), []);

    /* `true` quando o jogador está visualizando um lance passado. */
    const isViewingHistory = viewIndex !== null;

    return {
        viewIndex,
        effectiveIndex,
        viewGame,
        viewPieces,
        viewLastMove,
        focusedMoveIndex,
        isViewingHistory,
        goToStart,
        goBack,
        goForward,
        goToEnd,
        navigateTo,
        returnToLive,
    };
}
