import { Button } from "./ui/Button";

export function MatchSaveNotice({ status, onRetry }: { status: string; onRetry: () => void }) {
    return (
        <div className="mt-3 text-sm" role="status">
            {status === "saving" && <p className="text-text-muted">Salvando partida…</p>}
            {status === "saved" && <p className="text-success">Partida salva no seu histórico.</p>}
            {status === "guest" && <p className="text-text-muted">Partidas de visitantes não são salvas.</p>}
            {status === "unavailable" && <p className="text-text-muted">Esta partida não foi salva: o histórico está indisponível.</p>}
            {status === "error" && <>
                <p className="text-danger">Não foi possível salvar esta partida. Tente novamente antes de sair ou iniciar outra partida.</p>
                <Button variant="secondary" className="mt-3" onClick={onRetry}>Tentar salvar novamente</Button>
            </>}
        </div>
    );
}
