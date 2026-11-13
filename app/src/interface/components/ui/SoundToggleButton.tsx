import { useState, type ButtonHTMLAttributes } from "react";
import type { useSoundEffects } from "../../hooks/useSoundEffects";

interface SoundToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isMuted: ReturnType<typeof useSoundEffects>["isMuted"];
    onToggle: ReturnType<typeof useSoundEffects>["toggleMute"];
}

/*
    Botão acessível de Mute/Unmute para os efeitos sonoros do jogo.
    Exibe ícone SVG com tooltip/aria-label descritivo.
*/
export function SoundToggleButton({ isMuted, onToggle, className = "", ...rest }: SoundToggleButtonProps) {
    // Estado local para forçar re-render após toggle (mutedRef é um ref, não state)
    const [muted, setMuted] = useState<boolean>(isMuted());

    function handleClick() {
        const next = onToggle();
        setMuted(next);
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={muted ? "Ativar sons do jogo" : "Silenciar sons do jogo"}
            title={muted ? "Ativar sons" : "Silenciar sons"}
            aria-pressed={muted}
            className={`inline-flex items-center justify-center rounded-lg border border-border bg-surface-alt p-2 text-text-muted transition-colors hover:border-accent hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${className}`}
            {...rest}
        >
            {muted ? (
                /* Ícone mudo — alto-falante com X */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            ) : (
                /* Ícone com som — alto-falante com ondas */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            )}
        </button>
    );
}
