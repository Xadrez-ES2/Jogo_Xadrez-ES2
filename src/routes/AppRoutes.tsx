import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { RouteConfig } from "../types/route";
import { Layout } from "../components/layout/Layout";
import { Home } from "../pages/Home";
import { Game } from "../pages/Game";
import { Project } from "../pages/Project";
import { Team } from "../pages/Team";

/*
	Fonte única de verdade para as rotas da aplicação.
	
	- O Header lê `navRoutes` para montar o menu. 
	- O router usa `routeConfig` completo (incluindo o item desabilitado)
	para saber o que exibir.
 */
export const routeConfig: RouteConfig[] = [
	{ path: "/", label: "Início", element: Home, showInNav: true },
	{ path: "/jogo", label: "Jogar", element: Game, showInNav: true },
	{
		path: "/opcoes",
		label: "Opções",
		element: Home,
		showInNav: true,
		disabled: true,
		disabledHint: "Em breve",
	},
	{ path: "/projeto", label: "Sobre o Projeto", element: Project, showInNav: true },
	{ path: "/equipe", label: "Equipe", element: Team, showInNav: true },
];

export const navRoutes = routeConfig.filter((route) => route.showInNav);

const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: routeConfig
		.filter((route) => !route.disabled)
		.map((route) => ({
			path: route.path === "/" ? undefined : route.path.replace(/^\//, ""),
			index: route.path === "/",
			element: <route.element />,
		})),
	},
]);

export function AppRoutes() {
  	return <RouterProvider router={router} />;
}
