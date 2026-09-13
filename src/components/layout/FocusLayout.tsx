import { NavLink, Outlet } from "react-router-dom";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

/**
 * Layout alternativo ao <Layout /> padrão (Header + Footer completos).
 *
 * Pensado para telas de "foco" — ex: a mesa de jogo — onde o menu de
 * navegação completo e o rodapé em colunas só disputam espaço com o
 * conteúdo principal sem agregar valor durante a partida.
 *
 * Mantém apenas uma barra mínima com: link de volta à Home e o seletor
 * de tema (o usuário ainda pode trocar a paleta em qualquer tela).
 */
export function FocusLayout() {
    
    return (

        <div className="flex min-h-screen flex-col bg-background text-text-primary">
            
            <header className="border-b border-border bg-background/90 backdrop-blur">
                
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                    
                    <NavLink
                        to="/"
                        className="flex items-center gap-2 font-display text-base font-semibold text-text-primary transition-colors hover:text-accent"
                    >
                        <span aria-hidden="true" className="text-lg text-accent">
                            ♞
                        </span>
                        Voltar
                    
                    </NavLink>

                    <ThemeSwitcher />
                
                </div>
            
            </header>

            <main className="flex flex-1 flex-col">
                <Outlet />
            </main>
        
        </div>
    );
}