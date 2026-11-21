// @vitest-environment jsdom
import { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AccountControls } from "../../../interface/components/auth/AccountControls";
import { UserAvatar } from "../../../interface/components/auth/UserAvatar";
import { Login } from "../../../interface/pages/Login";
import { Register } from "../../../interface/pages/Register";
import { AuthProvider, useAuth } from "../../../interface/stores/AuthContext";
import type { AuthService, AuthUser } from "../../../interface/types/auth";
import { click, render } from "./harness";

// Serviço de autenticação controlado pelo teste: nenhuma chamada ao Firebase.
const ana: AuthUser = { uid: "u-1", displayName: "Nome Teste", email: "ana@exemplo.com", photoURL: "https://exemplo.com/claudio.png" };
function fakeService(overrides: Partial<AuthService> = {}) {
    let emitUser!: (user: AuthUser | null) => void, emitError!: (error: unknown) => void;
    const unsubscribe = vi.fn();
    const service: AuthService = {
        configured: true,
        subscribe: vi.fn((onUser, onError) => { emitUser = onUser; emitError = onError; return unsubscribe; }),
        signIn: vi.fn(async () => ({ user: ana, isNewUser: false })),
        signOut: vi.fn(async () => {}),
        ...overrides,
    };
    return {
        service, unsubscribe,
        user: (user: AuthUser | null) => act(async () => emitUser(user)),
        fail: (error: unknown) => act(async () => emitError(error)),
    };
}
let latest: ReturnType<typeof useAuth>;
function Probe() { latest = useAuth(); return null; }
const renderWith = (service: AuthService, node = <Probe />) =>
    render(<MemoryRouter><AuthProvider service={service}>{node}</AuthProvider></MemoryRouter>);
const buttonByText = (root: HTMLElement, text: string) =>
    [...root.querySelectorAll("button")].find((node) => node.textContent === text) ?? null;

describe("U-AUTH-CTX — estado de sessão do AuthProvider", () => {
    it("exige o provider", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        await expect(render(<Probe />)).rejects.toThrow("useAuth deve ser usado dentro de AuthProvider.");
    });
    it("sem configuração fica disponível como visitante e ignora ações", async () => {
        const { service } = fakeService({ configured: false });
        await renderWith(service);
        expect(latest).toMatchObject({ user: null, loading: false, available: false });
        await act(async () => { await latest.signIn(); await latest.signOut(); });
        expect(service.subscribe).not.toHaveBeenCalled();
        expect(service.signIn).not.toHaveBeenCalled();
        expect(service.signOut).not.toHaveBeenCalled();
    });
    it("acompanha usuário observado, cancela inscrição ao desmontar", async () => {
        const fake = fakeService();
        const view = await renderWith(fake.service);
        expect(latest.loading).toBe(true);
        await act(async () => { await latest.signIn(); });
        expect(fake.service.signIn).not.toHaveBeenCalled();
        await fake.user(ana);
        expect(latest).toMatchObject({ user: ana, loading: false, available: true });
        await fake.user(null);
        expect(latest.user).toBeNull();
        await view.unmount();
        expect(fake.unsubscribe).toHaveBeenCalledTimes(1);
    });
    it("falha na inscrição desativa o login com mensagem", async () => {
        const fake = fakeService();
        await renderWith(fake.service);
        await fake.fail({ code: "auth/invalid-api-key" });
        expect(latest).toMatchObject({ loading: false, available: false, user: null });
        expect(latest.error).toContain("indisponível");
    });
    it("entra, marca conta nova, evita chamadas concorrentes e sai", async () => {
        let finish!: () => void;
        const fake = fakeService({
            signIn: vi.fn(() => new Promise<{ user: AuthUser; isNewUser: boolean }>((done) => { finish = () => done({ user: ana, isNewUser: true }); })),
        });
        await renderWith(fake.service);
        await fake.user(null);
        let pending!: Promise<void>;
        await act(async () => { pending = latest.signIn(); });
        expect(latest.action).toBe("signIn");
        await act(async () => { await latest.signIn(); });
        expect(fake.service.signIn).toHaveBeenCalledTimes(1);
        await act(async () => { finish(); await pending; });
        expect(latest).toMatchObject({ user: ana, isNewUser: true, action: null, error: null });
        await act(async () => { await latest.signOut(); });
        expect(latest).toMatchObject({ user: null, isNewUser: false, action: null });
    });
    it("informa falhas de entrada e saída", async () => {
        const fake = fakeService({
            signIn: vi.fn(async () => { throw { code: "auth/popup-blocked" }; }),
            signOut: vi.fn(async () => { throw new Error("offline"); }),
        });
        await renderWith(fake.service);
        await fake.user(ana);
        await act(async () => { await latest.signIn(); });
        expect(latest.error).toContain("bloqueou");
        await act(async () => { await latest.signOut(); });
        expect(latest.error).toBe("Não foi possível sair da conta. Tente novamente.");
        expect(latest.user).toEqual(ana);
    });
    it("não atualiza estado depois de desmontado", async () => {
        let finishIn!: () => void, finishOut!: () => void;
        const fake = fakeService({
            signIn: vi.fn(() => new Promise<never>((_, fail) => { finishIn = () => fail(new Error("tarde")); })),
            signOut: vi.fn(() => new Promise<void>((done) => { finishOut = done; })),
        });
        const errors = vi.spyOn(console, "error");
        const first = await renderWith(fake.service);
        await fake.user(ana);
        let pending!: Promise<void>;
        await act(async () => { pending = latest.signIn(); });
        await first.unmount();
        await act(async () => { finishIn(); await pending; });

        const second = await renderWith(fake.service);
        await fake.user(ana);
        await act(async () => { pending = latest.signOut(); });
        await second.unmount();
        await act(async () => { finishOut(); await pending; });
        expect(fake.service.signIn).toHaveBeenCalledTimes(1);
        expect(fake.service.signOut).toHaveBeenCalledTimes(1);
        expect(errors).not.toHaveBeenCalled();
    });
    it("conclui entrada bem-sucedida e saída com falha depois de desmontado sem atualizar estado", async () => {
        let finishIn!: () => void, failOut!: () => void;
        const fake = fakeService({
            signIn: vi.fn(() => new Promise<{ user: AuthUser; isNewUser: boolean }>((done) => { finishIn = () => done({ user: ana, isNewUser: true }); })),
            signOut: vi.fn(() => new Promise<void>((_, fail) => { failOut = () => fail(new Error("offline")); })),
        });
        const errors = vi.spyOn(console, "error");
        const first = await renderWith(fake.service);
        await fake.user(null);
        let pending!: Promise<void>;
        await act(async () => { pending = latest.signIn(); });
        await first.unmount();
        await act(async () => { finishIn(); await pending; });
        const second = await renderWith(fake.service);
        await fake.user(ana);
        await act(async () => { pending = latest.signOut(); });
        await second.unmount();
        await act(async () => { failOut(); await pending; });
        expect(errors).not.toHaveBeenCalled();
    });
});

describe("U-AUTH-UI — telas e controles de conta", () => {
    it("UserAvatar usa a foto e recorre às iniciais quando ela falha", async () => {
        const { container } = await render(<UserAvatar name="ana maria souza" photoURL="https://exemplo.com/a.png" large />);
        const img = container.querySelector("img")!;
        expect(container.firstElementChild?.className).toContain("h-20");
        await act(async () => { img.dispatchEvent(new Event("error")); });
        expect(container.querySelector("img")).toBeNull();
        expect(container.textContent).toBe("AM");
        const small = await render(<UserAvatar name="Bia" photoURL={null} />);
        expect(small.container.firstElementChild?.className).toContain("h-8");
        expect(small.container.textContent).toBe("B");
    });
    it("AccountControls mostra verificação, link de entrada e conta conectada", async () => {
        const fake = fakeService();
        const view = await renderWith(fake.service, <AccountControls />);
        expect(view.container.textContent).toBe("Verificando conta…");
        await fake.user(null);
        expect(view.container.querySelector("a")?.getAttribute("href")).toBe("/login");
        await fake.user(ana);
        expect(view.container.querySelector('a[aria-label="Abrir perfil de Nome Teste"]')?.getAttribute("href")).toBe("/profile");
        let finish!: () => void;
        vi.mocked(fake.service.signOut).mockImplementationOnce(() => new Promise<void>((done) => { finish = done; }));
        await click(buttonByText(view.container, "Sair"));
        expect(buttonByText(view.container, "Saindo…")?.disabled).toBe(true);
        await act(async () => finish());
        expect(view.container.querySelector("a")?.getAttribute("href")).toBe("/login");
    });
    it("AccountControls exibe erro de saída", async () => {
        const fake = fakeService({ signOut: vi.fn(async () => { throw new Error("x"); }) });
        const view = await renderWith(fake.service, <AccountControls />);
        await fake.user(ana);
        await click(buttonByText(view.container, "Sair"));
        expect(view.container.querySelector('[role="alert"]')?.textContent).toContain("Não foi possível sair");
    });
    it("Login oferece entrada com Google e link para cadastro", async () => {
        const fake = fakeService();
        const view = await renderWith(fake.service, <Login />);
        expect(view.container.querySelector("h1")?.textContent).toBe("Entre na sua conta");
        expect(buttonByText(view.container, "Verificando sessão…")?.disabled).toBe(true);
        await fake.user(null);
        const links = [...view.container.querySelectorAll("a")].map((link) => link.getAttribute("href"));
        expect(links).toEqual(["/register", "/game"]);
        await act(async () => { view.container.querySelector("form")!.requestSubmit(); });
        expect(fake.service.signIn).toHaveBeenCalledTimes(1);
        expect(view.container.querySelector("h1")?.textContent).toBe("Você está conectado");
        expect(view.container.querySelector('[role="status"]')?.textContent).toBe("Acesso realizado com sucesso.");
        expect(view.container.querySelector("img")?.getAttribute("src")).toBe(ana.photoURL);
        expect(view.container.textContent).toContain(ana.email);
        await click(buttonByText(view.container, "Sair da conta"));
        expect(fake.service.signOut).toHaveBeenCalledTimes(1);
    });
    it("Login mostra espera do Google e erro retornado", async () => {
        let fail!: () => void;
        const fake = fakeService({ signIn: vi.fn(() => new Promise<never>((_, reject) => { fail = () => reject({ code: "auth/popup-closed-by-user" }); })) });
        const view = await renderWith(fake.service, <Login />);
        await fake.user(null);
        await act(async () => { view.container.querySelector("form")!.requestSubmit(); });
        expect(view.container.querySelector("form")?.getAttribute("aria-busy")).toBe("true");
        expect(buttonByText(view.container, "Aguardando Google…")).not.toBeNull();
        await act(async () => fail());
        expect(view.container.querySelector('[role="alert"]')?.textContent).toContain("cancelado");
    });
    it("Register adapta textos, mostra conta criada e indisponibilidade", async () => {
        const fake = fakeService({ signIn: vi.fn(async () => ({ user: { ...ana, email: null, photoURL: null }, isNewUser: true })) });
        const view = await renderWith(fake.service, <Register />);
        await fake.user(null);
        expect(view.container.querySelector("h1")?.textContent).toBe("Crie sua conta");
        expect(view.container.querySelector("a")?.getAttribute("href")).toBe("/login");
        await click(buttonByText(view.container, "Cadastrar com Google"));
        expect(view.container.querySelector("h1")?.textContent).toBe("Conta criada");
        expect(view.container.textContent).toContain("criado automaticamente com o Google");
        expect(view.container.querySelector("img")).toBeNull();

        const offline = await renderWith(fakeService({ configured: false }).service, <Register />);
        expect(offline.container.querySelector('[role="status"]')?.textContent).toContain("temporariamente indisponível");
        expect(buttonByText(offline.container, "Cadastrar com Google")?.disabled).toBe(true);
    });
});
