import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { RouteConfig } from "../types/route";
import { Layout } from "../components/layout/Layout";
import { Home } from "../pages/Home";
import { Game } from "../pages/Game";
import { Project } from "../pages/Project";
import { FocusLayout } from "../components/layout/FocusLayout";

/*
	Fonte única de verdade para as rotas da aplicação.
	
	- O Header lê `navRoutes` para montar o menu. 
	- O router usa `routeConfig` completo para saber o que exibir.
*/
export const routeConfig: RouteConfig[] = [
	{ path: "/", label: "Início", element: Home, showInNav: true },
	{ path: "/jogo", label: "Jogar", element: Game, showInNav: true },
	{ path: "/projeto", label: "Sobre o Projeto", element: Project, showInNav: true },
];

export const navRoutes = routeConfig.filter((route) => route.showInNav);

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: routeConfig
		.filter((route) => route.path !== "/jogo")
		.map((route) => ({
			path: route.path === "/" ? undefined : route.path.replace(/^\//, ""),
			index: route.path === "/",
			element: <route.element />,
		})),
	},
	// Adicionar outras rotas para o FocusLayout: página de Login e Cadastro, página de Jogo, etc.
	{
		path: "/jogo",
		element: <FocusLayout />,
		children: [{ index: true, element: <Game /> }],
	},
]);

export function AppRoutes() {
  	return <RouterProvider router={router} />;
}
