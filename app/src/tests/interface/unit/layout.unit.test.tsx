// @vitest-environment jsdom
import { act } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../../interface/App";
import { MatchSaveNotice } from "../../../interface/components/MatchSaveNotice";
import { Footer } from "../../../interface/components/layout/Footer";
import { Header } from "../../../interface/components/layout/Header";
import { Layout } from "../../../interface/components/layout/Layout";
import { Card } from "../../../interface/components/ui/Card";
import { Modal } from "../../../interface/components/ui/Modal";
import { SoundToggleButton } from "../../../interface/components/ui/SoundToggleButton";
import { teamMembers } from "../../../interface/data/team";
import { NotFound } from "../../../interface/pages/NotFound";
import { Project } from "../../../interface/pages/Project";
import { navRoutes, routeConfig } from "../../../interface/routes/AppRoutes";
import { AuthProvider } from "../../../interface/stores/AuthContext";
import { ThemeProvider } from "../../../interface/stores/ThemeContext";
import type { AuthService } from "../../../interface/types/auth";
import { click, render } from "./harness";

// O App real usa o serviço Firebase padrão; aqui ele é trocado por um visitante sem rede.
vi.mock("../../../interface/services/firebaseAuth", () => ({
    firebaseAuthService: { configured: false, subscribe: () => () => {}, signIn: vi.fn(), signOut: vi.fn() },
    getFirebaseClient: vi.fn(),
}));

const guest: AuthService = { configured: false, subscribe: () => () => {}, signIn: vi.fn(), signOut: vi.fn() };
const shell = (node: React.ReactNode, path = "/") => <MemoryRouter initialEntries={[path]}>
    <ThemeProvider><AuthProvider service={guest}>{node}</AuthProvider></ThemeProvider>
</MemoryRouter>;
const labels = (root: ParentNode, selector: string) => [...root.querySelectorAll(selector)].map((node) => node.textContent);

beforeEach(() => {
    Object.defineProperties(HTMLDialogElement.prototype, {
        showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
        close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } },
    });
});

describe("U-ROTAS — configuração de rotas e navegação", () => {
    it("expõe todas as páginas e apenas as públicas no menu", () => {
        expect(routeConfig.map((route) => route.path)).toEqual(["/", "/game", "/project", "/login", "/register", "/profile", "*"]);
        expect(navRoutes.map((route) => route.label)).toEqual(["Início", "Jogar", "Sobre o Projeto"]);
        expect(routeConfig.filter((route) => route.inFocusLayout).map((route) => route.path)).toEqual(["/game", "/login", "/register"]);
    });
    it("App monta o roteador, navega entre layouts e páginas", async () => {
        window.location.hash = "#/";
        const { container } = await render(<App />);
        expect(container.querySelector("header")).not.toBeNull();
        expect(container.querySelector("footer")).not.toBeNull();
        await click(container.querySelector<HTMLAnchorElement>('nav[aria-label="Navegação principal"] a[href="#/project"]'));
        expect(container.querySelector("h1")?.textContent).toBe("Sobre o projeto");
        await click(container.querySelector<HTMLAnchorElement>('header a[href="#/login"]'));
        expect(container.querySelector("h1")?.textContent).toBe("Entre na sua conta");
        expect(container.querySelector("footer")).toBeNull();
        window.location.hash = "";
    });
    it("App exibe a página 404 para rotas inexistentes, com cabeçalho e rodapé", async () => {
        window.location.hash = "#/";
        const { container } = await render(<App />);
        // O jsdom não emite popstate ao trocar o hash (o navegador emite); o evento é disparado aqui.
        await act(async () => {
            window.location.hash = "#/pagina/que-nao-existe";
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
        expect(container.querySelector("h1")?.textContent).toBe("Página não encontrada");
        expect(container.querySelector("code")?.textContent).toBe("/pagina/que-nao-existe");
        expect(container.querySelector("header")).not.toBeNull();
        expect(container.querySelector("footer")).not.toBeNull();
        await click(container.querySelector<HTMLAnchorElement>('main a[href="#/"]'));
        expect(container.querySelector("h1")?.textContent).toContain("Jogo de Xadrez Web");
        window.location.hash = "";
    });
});

describe("U-404 — página não encontrada", () => {
    it("informa a rota inexistente e oferece caminhos de volta", async () => {
        const { container } = await render(<MemoryRouter initialEntries={["/rota/antiga?x=1"]}><NotFound /></MemoryRouter>);
        expect(container.querySelector("h1")?.textContent).toBe("Página não encontrada");
        expect(container.textContent).toContain("Erro 404");
        expect(container.querySelector("code")?.textContent).toBe("/rota/antiga");
        const links = [...container.querySelectorAll("a")].map((link) => [link.textContent, link.getAttribute("href")]);
        expect(links).toEqual([["Voltar ao início", "/"], ["Jogar uma partida", "/game"]]);
        expect(container.querySelector("section")?.getAttribute("aria-labelledby")).toBe("not-found-title");
    });
});

describe("U-LAYOUT — cabeçalho, rodapé e casco das páginas", () => {
    it("Header lista a navegação e alterna o menu mobile", async () => {
        const { container } = await render(shell(<Header />));
        expect(labels(container, 'nav[aria-label="Navegação principal"] a')).toEqual(["Início", "Jogar", "Sobre o Projeto"]);
        const toggle = container.querySelector<HTMLButtonElement>('button[aria-label="Abrir menu de navegação"]')!;
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
        expect(container.querySelector('nav[aria-label="Navegação principal (mobile)"]')).toBeNull();
        await click(toggle);
        expect(toggle.getAttribute("aria-expanded")).toBe("true");
        expect(toggle.textContent).toBe("✕");
        const mobile = container.querySelector('nav[aria-label="Navegação principal (mobile)"]')!;
        expect(labels(mobile, "a")).toEqual(["Início", "Jogar", "Sobre o Projeto"]);
        expect(mobile.querySelector("select")).not.toBeNull();
        await click(toggle);
        expect(container.querySelector('nav[aria-label="Navegação principal (mobile)"]')).toBeNull();
    });
    it("Footer mostra links, mapa incorporado com sandbox e ano corrente", async () => {
        const { container } = await render(<MemoryRouter><Footer /></MemoryRouter>);
        expect(labels(container, 'nav[aria-label="Links do rodapé"] a')).toEqual(["Início", "Jogar", "Sobre o Projeto"]);
        const frame = container.querySelector("iframe")!;
        expect(frame.getAttribute("src")).toContain("google.com/maps/embed");
        expect(frame.getAttribute("sandbox")).toBe("allow-scripts allow-same-origin");
        expect(container.textContent).toContain(String(new Date().getFullYear()));
    });
    it("Layout envolve a rota atual com cabeçalho e rodapé", async () => {
        const { container } = await render(shell(<Routes>
            <Route element={<Layout />}><Route index element={<p>Conteúdo da rota</p>} /></Route>
        </Routes>));
        expect(container.querySelector("header + main")?.textContent).toBe("Conteúdo da rota");
        expect(container.querySelector("main + footer")).not.toBeNull();
    });
    it("Project apresenta todos os membros da equipe com links externos", async () => {
        const { container } = await render(<MemoryRouter><Project /></MemoryRouter>);
        expect(container.textContent).toContain(`${teamMembers.length} desenvolvedores`);
        for (const member of teamMembers) {
            const link = container.querySelector(`a[aria-label="GitHub de ${member.name}"]`);
            expect(link?.getAttribute("href")).toBe(member.githubUrl);
        }
    });
});

describe("U-UI — componentes visuais reutilizáveis", () => {
    it("Card aplica destaque e classes extras", async () => {
        const { container } = await render(<><Card>Normal</Card><Card highlighted className="extra">Destaque</Card></>);
        const [normal, highlighted] = [...container.querySelectorAll("div")];
        expect(normal.className).toContain("border-border");
        expect(highlighted.className).toContain("border-accent");
        expect(highlighted.className).toContain("extra");
    });
    it("Modal abre como diálogo, fecha com Esc e devolve o foco", async () => {
        const opener = document.createElement("button");
        document.body.append(opener);
        opener.focus();
        const onClose = vi.fn();
        const view = await render(<Modal title="Confirmação" onClose={onClose}><p>Corpo</p></Modal>);
        const dialog = view.container.querySelector("dialog")!;
        expect(dialog.open).toBe(true);
        expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe("Confirmação");
        const cancel = new Event("cancel", { cancelable: true });
        await act(async () => { dialog.dispatchEvent(cancel); });
        expect(cancel.defaultPrevented).toBe(true);
        expect(onClose).toHaveBeenCalledTimes(1);
        (document.activeElement as HTMLElement | null)?.blur();
        await view.unmount();
        expect(dialog.open).toBe(false);
        expect(document.activeElement).toBe(opener);
    });
    it("Modal não tenta focar elemento removido", async () => {
        const opener = document.createElement("button");
        document.body.append(opener);
        opener.focus();
        const view = await render(<Modal title="T" onClose={vi.fn()}>x</Modal>);
        opener.remove();
        await expect(view.unmount()).resolves.toBeUndefined();
    });
    it.each([
        ["saving", "Salvando partida…"], ["saved", "Partida salva no seu histórico."],
        ["guest", "Partidas de visitantes não são salvas."], ["unavailable", "o histórico está indisponível"],
    ])("MatchSaveNotice informa o estado %s", async (status, message) => {
        const { container } = await render(<MemoryRouter><MatchSaveNotice status={status} onRetry={vi.fn()} /></MemoryRouter>);
        expect(container.textContent).toContain(message);
        expect(container.querySelector("button")).toBeNull();
    });
    it("MatchSaveNotice permite tentar salvar novamente após erro", async () => {
        const onRetry = vi.fn();
        const { container } = await render(<MemoryRouter><MatchSaveNotice status="error" onRetry={onRetry} /></MemoryRouter>);
        expect(container.textContent).toContain("Não foi possível salvar esta partida");
        await click(container.querySelector("button"));
        expect(onRetry).toHaveBeenCalledTimes(1);
    });
    it("SoundToggleButton reflete e alterna o estado de mudo", async () => {
        let muted = false;
        const onToggle = vi.fn(() => (muted = !muted));
        const { container } = await render(<SoundToggleButton isMuted={() => muted} onToggle={onToggle} className="extra" />);
        const button = container.querySelector("button")!;
        expect(button.getAttribute("aria-label")).toBe("Silenciar sons do jogo");
        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.className).toContain("extra");
        await click(button);
        expect(button.getAttribute("aria-label")).toBe("Ativar sons do jogo");
        expect(button.getAttribute("title")).toBe("Ativar sons");
        expect(button.getAttribute("aria-pressed")).toBe("true");
        await click(button);
        expect(button.getAttribute("title")).toBe("Silenciar sons");
        expect(onToggle).toHaveBeenCalledTimes(2);
    });
});
