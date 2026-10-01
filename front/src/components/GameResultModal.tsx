import { type GameResult, resultTitles } from "../types/gameResult";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";

interface GameResultModalProps {
    result: GameResult;
    onClose: () => void;
    onRestart: () => void;
}

const outcomeColors: Record<GameResult["outcome"], string> = {
    victory: "text-success",
    defeat: "text-danger",
    draw: "text-accent",
};

export function GameResultModal({ result, onClose, onRestart }: GameResultModalProps) {
    return (
        <Modal title={resultTitles[result.outcome]} onClose={onClose}>
            <p className={`mt-3 font-semibold ${outcomeColors[result.outcome]}`}>Partida encerrada</p>
            <p className="mt-2 text-text-muted">{result.reason}</p>
            <div className="mt-6 flex flex-col gap-3">
                <Button onClick={onRestart} autoFocus>Jogar novamente</Button>
                <Button variant="secondary" onClick={onClose}>Ver tabuleiro</Button>
                <Button variant="ghost" to="/">Voltar ao início</Button>
            </div>
        </Modal>
    );
}
