// @vitest-environment jsdom
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Piece3D from "../../../interface/components/Piece3D";
import { ThemeSwitcher } from "../../../interface/components/ui/ThemeSwitcher";
import { themes } from "../../../interface/data/themes";
import { Project } from "../../../interface/pages/Project";
import { ThemeProvider, useTheme } from "../../../interface/stores/ThemeContext";
import { render } from "./harness";

// Dados da equipe substituídos para exercitar o campo opcional de biografia.
vi.mock("../../../interface/data/team", () => ({
    teamMembers: [
        { id: "a", name: "Pessoa A", role: "Interface Gráfica", avatarUrl: "a.png", githubUrl: "https://github.com/a", bio: "Cuida do tabuleiro." },
        { id: "b", name: "Pessoa B", role: "Máquina de Regras", avatarUrl: "b.png", githubUrl: "https://github.com/b" },
    ],
}));

async function choose(select: HTMLSelectElement, value: string) {
    await act(async () => {
        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
    });
}

describe("U-TEMA — paleta de cores", () => {
    it("exige o provider", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        function Probe() { useTheme(); return null; }
        await expect(render(<Probe />)).rejects.toThrow("Erro no useTheme");
    });
    it("aplica o tema padrão, troca pelo seletor e persiste a escolha", async () => {
        const { container } = await render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
        const select = container.querySelector("select")!;
        expect(select.value).toBe(themes[0].id);
        expect(document.documentElement.dataset.theme).toBe(themes[0].id);
        await choose(select, "ocean");
        expect(document.documentElement.dataset.theme).toBe("ocean");
        expect(localStorage.getItem("xadrez:theme")).toBe("ocean");
        expect(document.documentElement.style.getPropertyValue("--color-text-primary")).toBe(themes.find((t) => t.id === "ocean")!.palette.textPrimary);
    });
    it("restaura tema salvo válido e ignora valor desconhecido", async () => {
        localStorage.setItem("xadrez:theme", "light");
        const first = await render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
        expect(first.container.querySelector("select")!.value).toBe("light");
        await first.unmount();
        localStorage.setItem("xadrez:theme", "inexistente");
        const second = await render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
        expect(second.container.querySelector("select")!.value).toBe(themes[0].id);
    });
    it("recorre ao primeiro tema quando recebe um identificador inválido", async () => {
        let api!: ReturnType<typeof useTheme>;
        function Probe() { api = useTheme(); return null; }
        await render(<ThemeProvider><Probe /></ThemeProvider>);
        await act(async () => api.setThemeId("inexistente" as never));
        expect(api.theme.id).toBe(themes[0].id);
    });
});

describe("U-PEAO3D — peça decorativa animada", () => {
    it("gira a cada quadro e cancela a animação ao desmontar", async () => {
        let frame!: FrameRequestCallback;
        vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frame = callback; return 7; }));
        const cancel = vi.fn();
        vi.stubGlobal("cancelAnimationFrame", cancel);
        const view = await render(<Piece3D />);
        expect((view.container.firstElementChild as HTMLElement).className).toContain("min-h-screen");
        await act(async () => frame(performance.now() + 1000));
        await view.unmount();
        expect(cancel).toHaveBeenCalledWith(7);
    });
    it("aceita classes próprias e não cancela quadro inexistente", async () => {
        vi.stubGlobal("requestAnimationFrame", vi.fn(() => 0));
        const cancel = vi.fn();
        vi.stubGlobal("cancelAnimationFrame", cancel);
        const view = await render(<Piece3D className="h-40" />);
        const root = view.container.firstElementChild as HTMLElement;
        expect(root.className).toContain("h-40");
        expect(root.className).not.toContain("min-h-screen");
        await view.unmount();
        expect(cancel).not.toHaveBeenCalled();
    });
});

describe("U-PROJETO — biografia opcional da equipe", () => {
    it("exibe a biografia apenas de quem a possui", async () => {
        const { container } = await render(<MemoryRouter><Project /></MemoryRouter>);
        expect(container.textContent).toContain("Cuida do tabuleiro.");
        expect(container.textContent).toContain("2 desenvolvedores");
    });
});
