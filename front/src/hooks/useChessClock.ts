import { useEffect, useRef, useState } from "react";
import type { PieceColor } from "../types/pieces";

export type ClockTimes = Record<PieceColor, number>;
export const INITIAL_TIME_MS = 10 * 60 * 1000;

interface ChessClockOptions {
    activeColor: PieceColor;
    running: boolean;
    resetKey: number;
    onTimeout: (color: PieceColor) => void;
    initialTimeMs?: number;
}

export function useChessClock({ activeColor, running, resetKey, onTimeout, initialTimeMs = INITIAL_TIME_MS }: ChessClockOptions) {
    const [times, setTimes] = useState<ClockTimes>({ white: initialTimeMs, black: initialTimeMs });
    const remaining = useRef(times);
    const timeoutReported = useRef(false);

    useEffect(() => {
        remaining.current = { white: initialTimeMs, black: initialTimeMs };
        timeoutReported.current = false;
        setTimes(remaining.current);
    }, [resetKey, initialTimeMs]);

    useEffect(() => {
        if (!running || remaining.current[activeColor] === 0) return;
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
    }, [activeColor, running, resetKey, initialTimeMs]);

    useEffect(() => {
        if (remaining.current[activeColor] === 0 && !timeoutReported.current) {
            timeoutReported.current = true;
            onTimeout(activeColor);
        }
    }, [times, activeColor, onTimeout]);

    return times;
}
