import { useEffect, useRef, useState } from "react";
import type { PieceColor } from "../types/pieces";

export type ClockTimes = Record<PieceColor, number>;
export const INITIAL_TIME_MS = 10 * 60 * 1000;

interface ChessClockOptions {
    activeColor: PieceColor;
    running: boolean;
    resetKey: number;
    onTimeout: (color: PieceColor) => void;
    /* Duração inicial em ms. `null` desativa o relógio (partida sem tempo). */
    initialTimeMs?: number | null;
}

export function useChessClock({
    activeColor,
    running,
    resetKey,
    onTimeout,
    initialTimeMs = INITIAL_TIME_MS,
}: ChessClockOptions): ClockTimes | undefined {
    const hasTimer = initialTimeMs !== null && initialTimeMs !== undefined;
    const baseTime = initialTimeMs ?? INITIAL_TIME_MS;

    const [times, setTimes] = useState<ClockTimes>({ white: baseTime, black: baseTime });
    const remaining = useRef(times);
    const timeoutReported = useRef(false);

    useEffect(() => {
        if (!hasTimer) return;
        remaining.current = { white: baseTime, black: baseTime };
        timeoutReported.current = false;
        setTimes(remaining.current);
    }, [resetKey, baseTime, hasTimer]);

    useEffect(() => {
        if (!hasTimer || !running || remaining.current[activeColor] === 0) return;
        const startedAt = Date.now();
        const startingTime = remaining.current[activeColor];

        function update() {
            // Mede tempo decorrido mesmo quando a aba está em segundo plano.
            const nextTime = Math.max(0, startingTime - Math.max(0, Date.now() - startedAt));
            if (nextTime === remaining.current[activeColor]) return;
            remaining.current = { ...remaining.current, [activeColor]: nextTime };
            setTimes(remaining.current);
        }

        const timer = globalThis.setInterval(update, 100);
        return () => {
            globalThis.clearInterval(timer);
            // Preserva frações de segundo ao pausar ou trocar de jogador.
            update();
        };
    }, [activeColor, running, resetKey, baseTime, hasTimer]);

    useEffect(() => {
        if (!hasTimer) return;
        if (remaining.current[activeColor] === 0 && !timeoutReported.current) {
            timeoutReported.current = true;
            onTimeout(activeColor);
        }
    }, [times, activeColor, onTimeout, hasTimer]);

    if (!hasTimer) {
        return undefined;
    }

    return times;
}
