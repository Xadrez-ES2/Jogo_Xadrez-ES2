import { NavLink, Outlet } from "react-router-dom";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { AccountControls } from "../auth/AccountControls";

/*
    Layout alternativo ao <Layout /> padrão (Header + Footer completos).

    Pensado para telas de "Foco" — Ex.: mesa de jogo, páginas de login e cadastro 

    Mantém apenas uma barra mínima com: link de volta à Home e o seletor
    de tema (o usuário ainda pode trocar a paleta em qualquer tela).
*/
export function FocusLayout() {
    
    return (
        <div className="flex h-screen flex-col bg-background text-text-primary">
            
            <header className="shrink-0 border-b border-border bg-background/90 backdrop-blur">
                
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
                    <NavLink
                        to="/"
                        className="flex items-center gap-2.5 rounded-lg px-2 py-1 font-display text-base font-semibold text-text-primary transition-colors hover:bg-surface-alt/60 hover:text-accent"
                    >
                        <span aria-hidden="true" className="text-xl text-accent">
                            ♞
                        </span>
                        Voltar
                    
                    </NavLink>
            
                    <div className="flex items-center justify-end gap-4 sm:gap-6">
                        <AccountControls />
                        <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
                        <ThemeSwitcher />
                    </div>
                </div>
            
            </header>
    
            <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden">
                <Outlet />
            </main>
        
        </div>
    );
}
