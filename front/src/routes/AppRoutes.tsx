import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { RouteConfig } from "../types/route";
import { Layout } from "../components/layout/Layout";
import { Home } from "../pages/Home";
import { Game } from "../pages/Game";
import { Project } from "../pages/Project";
import { FocusLayout } from "../components/layout/FocusLayout";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Profile } from "../pages/Profile";

/*
	Fonte única de verdade para as rotas da aplicação.
	
	- O Header lê `navRoutes` para montar o menu. 
	- O router usa `routeConfig` completo para saber o que exibir.
*/
export const routeConfig: RouteConfig[] = [
	{ path: "/", label: "Início", element: Home, showInNav: true, inFocusLayout: false },
	{ path: "/game", label: "Jogar", element: Game, showInNav: true, inFocusLayout: true },
	{ path: "/project", label: "Sobre o Projeto", element: Project, showInNav: true, inFocusLayout: false },
	{ path: "/login", label: "Login", element: Login, showInNav: true, inFocusLayout: true },
	{ path: "/register", label: "Cadastrar", element: Register, showInNav: false, inFocusLayout: true },
	{ path: "/profile", label: "Perfil", element: Profile, showInNav: false, inFocusLayout: false },
];

export const navRoutes = routeConfig.filter((route) => route.showInNav);

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: routeConfig
		.filter((route) => !route.inFocusLayout)
		.map((route) => ({
			path: route.path === "/" ? undefined : route.path.replace(/^\//, ""),
			index: route.path === "/",
			element: <route.element />,
		})),
	},
	{
		element: <FocusLayout />,
		children: routeConfig
		.filter((route) => route.inFocusLayout)
		.map((route) => ({
			path: route.path.replace(/^\//, ""),
			element: <route.element />,
		})),
	},
]);

export function AppRoutes() {
  	return <RouterProvider router={router} />;
}
