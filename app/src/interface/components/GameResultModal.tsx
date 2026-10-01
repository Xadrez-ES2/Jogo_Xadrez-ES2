import { type GameResult, resultTitles } from "../types/gameResult";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import type { ReactNode } from "react";

interface GameResultModalProps {
    result: GameResult;
    onClose: () => void;
    onRestart: () => void;
    restartingDisabled?: boolean;
    children?: ReactNode;
}

const outcomeColors: Record<GameResult["outcome"], string> = {
    victory: "text-success",
    defeat: "text-danger",
    draw: "text-accent",
};

export function GameResultModal({ result, onClose, onRestart, restartingDisabled = false, children }: GameResultModalProps) {
    return (
        <Modal title={resultTitles[result.outcome]} onClose={onClose}>
            <p className={`mt-3 font-semibold ${outcomeColors[result.outcome]}`}>Partida encerrada</p>
            <p className="mt-2 text-text-muted">{result.reason}</p>
            {children}
            <div className="mt-6 flex flex-col gap-3">
                <Button onClick={onRestart} disabled={restartingDisabled} autoFocus>Jogar novamente</Button>
                <Button variant="secondary" onClick={onClose}>Ver tabuleiro</Button>
                <Button variant="ghost" to="/">Voltar ao início</Button>
            </div>
        </Modal>
    );
}
