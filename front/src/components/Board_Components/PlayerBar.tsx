import type { Player } from "../../types/player";
import { getInitials } from "../../utils/AuxFunctions";
import { ChessClock } from "./ChessClock";

 
/*
    Componente de Barra de identificação de um jogador
    
    - Contém avatar, nome, cor das peças e
    espaço reservado para peças capturadas. 
*/
export function PlayerBar({ player, remainingMs, clockActive = false }: { player?: Player; remainingMs?: number; clockActive?: boolean }) {
    
    if (!player) {
        return (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-4 py-3">
                <span className="font-mono text-xs text-text-muted/50">Jogador não definido</span>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-1.5">
            
            <div className="flex min-w-0 items-center gap-3">
                
                {/* Slot de avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-alt">
                    {player.avatarUrl ? (
                        <img
                            src={player.avatarUrl}
                            alt={`Avatar de ${player.name}`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="font-mono text-xs font-semibold text-text-muted">
                            {getInitials(player.name)}
                        </span>
                    )}
                </div>
        
                <div className="min-w-0">
                    
                    <p className="truncate font-body text-sm font-semibold text-text-primary">
                        {player.name}
                        
                        {player.rating !== undefined && (
                            <span className="ml-2 font-mono text-xs font-normal text-text-muted">
                                {player.rating} · {player.color === "white" ? "Brancas" : "Pretas"}
                            </span>
                        )}
                    
                    </p>
                
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                        ♟♟♟ ♟️♟️♟️
                    </span>
                
                </div>
            
            </div>
    
            {remainingMs !== undefined && (
                <ChessClock remainingMs={remainingMs} active={clockActive} playerName={player.name} />
            )}
        
        </div>
    );
}
