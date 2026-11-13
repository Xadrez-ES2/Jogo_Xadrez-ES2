interface ChessClockProps {
    remainingMs: number;
    active: boolean;
    playerName: string;
}

export function ChessClock({ remainingMs, active, playerName }: ChessClockProps) {
    const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const display = hours > 0
        ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        : `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    const lowTime = remainingMs <= 30_000;

    return (
        <div
            role="timer"
            aria-label={`Tempo de ${playerName}: ${display}${active ? ", relógio ativo" : ", relógio parado"}`}
            className={`shrink-0 rounded-lg border px-2 py-1.5 font-mono text-base tabular-nums sm:text-xl ${
                lowTime ? "border-danger bg-surface-alt text-danger" : active
                    ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface-alt text-text-muted"
            }`}
        >
            {display}
        </div>
    );
}
