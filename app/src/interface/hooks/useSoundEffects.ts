import { useCallback, useEffect, useRef } from "react";


// VER SONS BONS 

/*
    Eventos de áudio suportados pelo jogo.
    Mapeados para os arquivos em app/src/sounds.
*/
export type SoundEvent = "move" | "capture" | "check" | "castle" | "gameOver" | "illegal";

const SOUND_MAP: Record<SoundEvent, string> = {
    move: "../../sounds/Move.mp3",
    capture: "../../sounds/Capture.mp3",
    check: "../../sounds/Check.mp3",
    castle: "../../sounds/Move.mp3",
    gameOver: "../../sounds/Victory.mp3",
    illegal: "../../sounds/Check.mp3",
};

const STORAGE_KEY = "chess-muted";

function loadMutedPreference(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

function saveMutedPreference(muted: boolean): void {
    try {
        localStorage.setItem(STORAGE_KEY, String(muted));
    } catch {
        // localStorage indisponível — ignora silenciosamente
    }
}

/*
    Hook para gerenciar efeitos sonoros do jogo de xadrez.

    - Tolerante a falhas: arquivos ausentes, erro de decode ou bloqueio
      de autoplay nunca lançam exceções não tratadas nem travam a UI.
    - Utiliza os arquivos de som de app/src/sounds/.
    - A preferência de mute é persistida no localStorage.
*/
export function useSoundEffects() {
    const mutedRef = useRef<boolean>(loadMutedPreference());

    // Pré-carrega os sons no cache do navegador para execução instantânea
    useEffect(() => {
        if (typeof Audio === "undefined") return;
        Object.values(SOUND_MAP).forEach((url) => {
            try {
                const audio = new Audio(url);
                audio.preload = "auto";
            } catch {
                // Silencioso em caso de restrição do ambiente
            }
        });
    }, []);

    /*
        Dispara um efeito sonoro para o evento dado.
        Silencioso se: mutado, falha de reprodução ou autoplay bloqueado.
    */
    const play = useCallback((event: SoundEvent) => {
        if (mutedRef.current) return;
        if (typeof Audio === "undefined") return;

        const src = SOUND_MAP[event];
        if (!src) return;

        try {
            const audio = new Audio(src);
            audio.volume = 0.7;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay prevenido ou erro de áudio — ignora silenciosamente
                });
            }
        } catch {
            // Qualquer erro inesperado — ignora silenciosamente
        }
    }, []);

    /*
        Alterna o estado de mudo e persiste a preferência.
        Retorna o novo valor de muted.
    */
    const toggleMute = useCallback((): boolean => {
        const next = !mutedRef.current;
        mutedRef.current = next;
        saveMutedPreference(next);
        return next;
    }, []);

    const isMuted = useCallback(() => mutedRef.current, []);

    return { play, toggleMute, isMuted };
}
