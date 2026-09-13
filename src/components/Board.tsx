import type { Player } from "../types/player";
import { PlayerBar } from "./PlayerBar";

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