// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MatchRecord } from "../../../interface/types/matchHistory";

// Todo o SDK do Firebase é substituído: os testes verificam apenas o adaptador da interface.
const fb = vi.hoisted(() => {
    const auth = { currentUser: null as { uid: string } | null, languageCode: "" };
    return {
        auth,
        app: { initializeApp: vi.fn(() => ({ name: "chess-auth" })) },
        sdk: {
            getAuth: vi.fn(() => auth),
            setPersistence: vi.fn(async () => {}),
            browserSessionPersistence: "session",
            GoogleAuthProvider: class { params?: object; setCustomParameters(params: object) { this.params = params; } },
            onAuthStateChanged: vi.fn(),
            signInWithPopup: vi.fn(),
            getAdditionalUserInfo: vi.fn(),
            signOut: vi.fn(async () => {}),
        },
        store: {
            getFirestore: vi.fn(() => "db"),
            collection: vi.fn((...path: unknown[]) => ({ path })),
            orderBy: vi.fn((field: string, dir: string) => ({ field, dir })),
            query: vi.fn((...parts: unknown[]) => ({ parts })),
            onSnapshot: vi.fn(),
            doc: vi.fn((...path: unknown[]) => ({ path })),
            runTransaction: vi.fn(),
            serverTimestamp: vi.fn(() => "agora"),
        },
    };
});
vi.mock("firebase/app", () => fb.app);
vi.mock("firebase/auth", () => fb.sdk);
vi.mock("firebase/firestore", () => fb.store);

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
function configure(firestore = "true") {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "chave");
    vi.stubEnv("VITE_FIREBASE_AUTH_DOMAIN", "dominio");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "projeto");
    vi.stubEnv("VITE_FIREBASE_APP_ID", "app");
    vi.stubEnv("VITE_FIRESTORE_ENABLED", firestore);
}
const loadAuth = () => import("../../../interface/services/firebaseAuth");
const loadHistory = () => import("../../../interface/services/matchHistory");

beforeEach(() => {
    vi.resetModules();
    fb.auth.currentUser = null;
    for (const group of [fb.app, fb.sdk, fb.store]) {
        for (const value of Object.values(group)) if (vi.isMockFunction(value)) value.mockClear();
    }
});
afterEach(() => { vi.unstubAllEnvs(); });

describe("U-FIREBASE-AUTH — adaptador de autenticação", () => {
    it("fica desativado sem configuração completa", async () => {
        configure();
        vi.stubEnv("VITE_FIREBASE_APP_ID", "   ");
        const { firebaseAuthService, getFirebaseClient } = await loadAuth();
        expect(firebaseAuthService.configured).toBe(false);
        expect(() => getFirebaseClient()).toThrow("Autenticação não configurada.");
    });
    it("inicializa o cliente uma única vez com idioma, sessão e seleção de conta", async () => {
        configure();
        const { firebaseAuthService, getFirebaseClient } = await loadAuth();
        expect(firebaseAuthService.configured).toBe(true);
        const [first, second] = await Promise.all([getFirebaseClient(), getFirebaseClient()]);
        expect(first).toBe(second);
        expect(fb.app.initializeApp).toHaveBeenCalledExactlyOnceWith(
            { apiKey: "chave", authDomain: "dominio", projectId: "projeto", appId: "app" }, "chess-auth");
        expect(fb.auth.languageCode).toBe("pt-BR");
        expect(fb.sdk.setPersistence).toHaveBeenCalledWith(fb.auth, "session");
        expect(first.provider).toMatchObject({ params: { prompt: "select_account" } });
    });
    it("permite nova tentativa quando a inicialização falha", async () => {
        configure();
        fb.sdk.setPersistence.mockRejectedValueOnce(new Error("storage bloqueado"));
        const { getFirebaseClient } = await loadAuth();
        await expect(getFirebaseClient()).rejects.toThrow("storage bloqueado");
        await expect(getFirebaseClient()).resolves.toMatchObject({ auth: fb.auth });
        expect(fb.app.initializeApp).toHaveBeenCalledTimes(2);
    });
    it("converte o usuário observado e cancela a inscrição", async () => {
        configure();
        const stop = vi.fn();
        fb.sdk.onAuthStateChanged.mockImplementation((_auth, next: (user: unknown) => void) => {
            next({ uid: "u-1", displayName: "", email: "a@b.c", photoURL: null });
            next(null);
            return stop;
        });
        const { firebaseAuthService } = await loadAuth();
        const onUser = vi.fn(), onError = vi.fn();
        const unsubscribe = firebaseAuthService.subscribe(onUser, onError);
        await flush();
        expect(onUser.mock.calls).toEqual([[{ uid: "u-1", displayName: "Jogador", email: "a@b.c", photoURL: null }], [null]]);
        unsubscribe();
        expect(stop).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });
    it("não inscreve se cancelado antes de inicializar e repassa erros", async () => {
        configure();
        const { firebaseAuthService } = await loadAuth();
        const onError = vi.fn();
        firebaseAuthService.subscribe(vi.fn(), onError)();
        await flush();
        expect(fb.sdk.onAuthStateChanged).not.toHaveBeenCalled();

        vi.resetModules();
        fb.sdk.setPersistence.mockRejectedValueOnce(new Error("falhou"));
        const fresh = (await loadAuth()).firebaseAuthService;
        fresh.subscribe(vi.fn(), onError);
        await flush();
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "falhou" }));

        vi.resetModules();
        fb.sdk.setPersistence.mockRejectedValueOnce(new Error("ignorado"));
        const cancelled = vi.fn();
        (await loadAuth()).firebaseAuthService.subscribe(vi.fn(), cancelled)();
        await flush();
        expect(cancelled).not.toHaveBeenCalled();
    });
    it("entra pelo popup informando conta nova e sai", async () => {
        configure();
        fb.sdk.signInWithPopup.mockResolvedValueOnce({ user: { uid: "u-2", displayName: "Bia", email: null, photoURL: "f.png" } })
            .mockResolvedValueOnce({ user: { uid: "u-2", displayName: "Bia", email: null, photoURL: null } });
        fb.sdk.getAdditionalUserInfo.mockReturnValueOnce({ isNewUser: true }).mockReturnValueOnce(null);
        const { firebaseAuthService } = await loadAuth();
        await expect(firebaseAuthService.signIn()).resolves.toEqual({
            user: { uid: "u-2", displayName: "Bia", email: null, photoURL: "f.png" }, isNewUser: true });
        await expect(firebaseAuthService.signIn()).resolves.toMatchObject({ isNewUser: false });
        await firebaseAuthService.signOut();
        expect(fb.sdk.signOut).toHaveBeenCalledWith(fb.auth);
    });
});

const record: MatchRecord = {
    id: "m-1", ownerUid: "u-1", endedAt: 1_700_000_000_000, outcome: "victory",
    reason: "Xeque-mate", reasonCode: "checkmate", difficulty: "hard", opponent: "Bot",
};
const { id: _id, ...stored } = record;

describe("U-FIRESTORE — adaptador do histórico de partidas", () => {
    it("só fica configurado com autenticação e Firestore habilitados", async () => {
        configure("false");
        expect((await loadHistory()).matchHistoryService.configured).toBe(false);
        vi.resetModules();
        configure("true");
        expect((await loadHistory()).matchHistoryService.configured).toBe(true);
    });
    it("assina a coleção do usuário em ordem decrescente e valida registros", async () => {
        configure();
        fb.auth.currentUser = { uid: "u-1" };
        const stop = vi.fn();
        let emit!: (snapshot: unknown) => void;
        fb.store.onSnapshot.mockImplementation((_query, next: (s: unknown) => void) => { emit = next; return stop; });
        const { matchHistoryService } = await loadHistory();
        const onRecords = vi.fn(), onError = vi.fn();
        const unsubscribe = matchHistoryService.subscribe("u-1", onRecords, onError);
        await flush();
        expect(fb.store.collection).toHaveBeenCalledWith("db", "users", "u-1", "matches");
        expect(fb.store.orderBy).toHaveBeenCalledWith("endedAt", "desc");
        emit({ docs: [{ id: "m-1", data: () => stored }] });
        expect(onRecords).toHaveBeenCalledWith([record]);
        emit({ docs: [{ id: "m-2", data: () => ({ ...stored, outcome: "abandono" }) }] });
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "Registro de partida inválido." }));
        unsubscribe();
        emit({ docs: [] });
        expect(onRecords).toHaveBeenCalledTimes(1);
        expect(stop).toHaveBeenCalledTimes(1);
    });
    it.each([
        ["dono diferente", { ownerUid: "outro" }], ["data não numérica", { endedAt: "ontem" }],
        ["data infinita", { endedAt: Infinity }], ["data zero", { endedAt: 0 }], ["data fora do limite", { endedAt: 9e15 }],
        ["dificuldade inválida", { difficulty: "extrema" }], ["motivo inválido", { reasonCode: "abandono" }],
        ["texto do motivo ausente", { reason: 1 }], ["oponente ausente", { opponent: undefined }],
    ])("rejeita registro com %s", async (_name, patch) => {
        configure();
        fb.auth.currentUser = { uid: "u-1" };
        let emit!: (snapshot: unknown) => void;
        fb.store.onSnapshot.mockImplementation((_query, next: (s: unknown) => void) => { emit = next; return vi.fn(); });
        const onError = vi.fn();
        (await loadHistory()).matchHistoryService.subscribe("u-1", vi.fn(), onError);
        await flush();
        emit({ docs: [{ id: "x", data: () => ({ ...stored, ...patch }) }] });
        expect(onError).toHaveBeenCalledTimes(1);
    });
    it("recusa sessão alterada e ignora falhas após cancelar", async () => {
        configure();
        fb.auth.currentUser = { uid: "outro" };
        const { matchHistoryService } = await loadHistory();
        const onError = vi.fn();
        matchHistoryService.subscribe("u-1", vi.fn(), onError);
        await flush();
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "Sessão alterada." }));
        const silent = vi.fn();
        matchHistoryService.subscribe("u-1", vi.fn(), silent)();
        await flush();
        expect(silent).not.toHaveBeenCalled();
        expect(fb.store.onSnapshot).not.toHaveBeenCalled();
    });
    it("ignora falha de inicialização que chega depois do cancelamento", async () => {
        configure();
        fb.sdk.setPersistence.mockRejectedValueOnce(new Error("tarde demais"));
        const onError = vi.fn();
        (await loadHistory()).matchHistoryService.subscribe("u-1", vi.fn(), onError)();
        await flush();
        expect(onError).not.toHaveBeenCalled();
    });
    it("salva novo registro em transação com carimbo do servidor", async () => {
        configure();
        fb.auth.currentUser = { uid: "u-1" };
        const set = vi.fn();
        fb.store.runTransaction.mockImplementation(async (_db, run: (t: unknown) => Promise<void>) =>
            run({ get: async () => ({ exists: () => false }), set }));
        await (await loadHistory()).matchHistoryService.save(record);
        expect(fb.store.doc).toHaveBeenCalledWith("db", "users", "u-1", "matches", "m-1");
        expect(set).toHaveBeenCalledWith({ path: ["db", "users", "u-1", "matches", "m-1"] }, { ...stored, savedAt: "agora" });
    });
    it("é idempotente para o mesmo resultado e protege resultado definitivo", async () => {
        configure();
        fb.auth.currentUser = { uid: "u-1" };
        const set = vi.fn();
        let existing = stored as Record<string, unknown>;
        fb.store.runTransaction.mockImplementation(async (_db, run: (t: unknown) => Promise<void>) =>
            run({ get: async () => ({ exists: () => true, id: "m-1", data: () => existing }), set }));
        const { matchHistoryService } = await loadHistory();
        await expect(matchHistoryService.save(record)).resolves.toBeUndefined();
        existing = { ...stored, outcome: "defeat" };
        await expect(matchHistoryService.save(record)).rejects.toThrow("Esta partida já possui um resultado definitivo.");
        expect(set).not.toHaveBeenCalled();
    });
    it("não salva quando a sessão mudou", async () => {
        configure();
        fb.auth.currentUser = null;
        await expect((await loadHistory()).matchHistoryService.save(record)).rejects.toThrow("Sessão alterada.");
        expect(fb.store.runTransaction).not.toHaveBeenCalled();
    });
});
