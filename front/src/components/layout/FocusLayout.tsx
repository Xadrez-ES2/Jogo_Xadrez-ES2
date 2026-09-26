import { NavLink, Outlet } from "react-router-dom";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

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
                
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1.5">
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
    
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <Outlet />
            </main>
        
        </div>
    );
}