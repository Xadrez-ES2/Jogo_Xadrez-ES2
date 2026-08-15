import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/*
	Casco visual compartilhado por todas as páginas: cabeçalho fixo,
	conteúdo da rota atual (via <Outlet />) e rodapé.
*/
export function Layout() {
	
	return (
		
		<div className="flex min-h-screen flex-col bg-background text-text-primary">
			
			<Header />
			
			<main className="flex-1">
			
				<Outlet />
			
			</main>
			
			<Footer />
		
		</div>
	);
}
