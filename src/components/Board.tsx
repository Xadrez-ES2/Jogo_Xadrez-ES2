import type { Player } from "../types/player";

const FILES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

/* 
  	Componente do Tabuleiro

    Apresenta apenas o visual atualmente.
*/
interface BoardProps {
    
    /* Jogador exibido acima do tabuleiro (O bot). */
    topPlayer?: Player;
    
    /* Jogador exibido abaixo do tabuleiro (O usuário). */
    bottomPlayer?: Player;
}
 
/*
    Iniciais usadas como fallback visual se o jogador não tem avatar
*/
function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}
 
/*
    Componente de Barra de identificação de um jogador
    
    - Contém avatar, nome, cor das peças e
    espaço reservado para peças capturadas. 
*/
function PlayerBar({ player }: { player?: Player }) {
    
    if (!player) {
        return (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-4 py-3">
                <span className="font-mono text-xs text-text-muted/50">Jogador não definido</span>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-1">
            <div className="flex min-w-0 items-center gap-3">
                
                {/* Slot de avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-alt">
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
                                {player.rating}
                            </span>
                        )}
                    
                    </p>
                
                    {/* <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                        {player.isBot ? "Bot" : "Jogador"} · {player.color === "white" ? "Brancas" : "Pretas"}
                    </span> */}
                
                </div>
            
            </div>
    
            {/* Slot reservado para peças capturadas. */}
            <div className="hidden shrink-0 items-center gap-1 sm:flex" aria-hidden="true">
                <span className="font-mono text-[10px] text-text-muted/40">capturas</span>
            </div>
        
        </div>
    );
}
 
/*
    Componente de tabuleiro
*/
export function Board({ topPlayer, bottomPlayer }: BoardProps) {
    
    return (
        
        <div className="flex flex-col items-center gap-3">
            
            <div className="w-full max-w-[560px]">
                <PlayerBar player={topPlayer} />
            </div>
    
            <div className="w-full max-w-[560px]">
                
                <div className="flex gap-2">
                    
                    {/* Régua de linhas (ranks)  */}
                    <div className="grid w-5 grid-rows-8 sm:w-6">
                        
                        {RANKS.map((rank) => (
                            <span
                                key={rank}
                                className="flex items-center justify-end pr-1 font-mono text-[10px] text-text-muted"
                            >
                                {rank}
                            </span>
                        ))}
                    
                    </div>
            
                    <div className="grid aspect-square flex-1 grid-cols-8 grid-rows-8 overflow-hidden rounded-lg border border-border shadow-2xl shadow-black/30">
                        
                        {RANKS.flatMap((rank, rowIndex) =>
                            FILES.map((file, colIndex) => {
                                const isLight = (rowIndex + colIndex) % 2 === 0;
                                
                                return (
                                    <div
                                        key={`${file}${rank}`}
                                        className={isLight ? "bg-board-light" : "bg-board-dark"}
                                    />
                                );
                            })
                        )}
                    
                    </div>
                
                </div>
        
                {/* Régua de colunas (files) */}
                <div className="mt-1 flex gap-2">
                    
                    <div className="w-5 sm:w-6" aria-hidden="true" />
                    
                    <div className="grid flex-1 grid-cols-8">
                        {FILES.map((file) => (
                            <span
                                key={file}
                                className="text-center font-mono text-[10px] uppercase text-text-muted"
                            >
                                {file}
                            </span>
                        ))}
                    </div>
                
                </div>
            
            </div>
        
            <div className="w-full max-w-[560px]">
                <PlayerBar player={bottomPlayer} />
            </div>
        
        </div>
    );
}