// @vitest-environment jsdom
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSaveMatch } from "../../../interface/hooks/useSaveMatch";
import type { MatchRecord } from "../../../interface/types/matchHistory";
import { mountHook } from "./harness";

// Substitui a fronteira de persistência: nenhuma chamada real ao Firestore.
const service = vi.hoisted(() => ({ configured: true, save: vi.fn<(record: MatchRecord) => Promise<void>>() }));
vi.mock("../../../interface/stores/MatchHistoryContext", () => ({ useMatchHistoryService: () => service }));
const record: MatchRecord = {
    id: "partida-1", ownerUid: "jogador-1", endedAt: 1000, outcome: "victory",
    reason: "Xeque-mate", reasonCode: "checkmate", difficulty: "easy", opponent: "Bot",
};
beforeEach(() => { service.configured = true; service.save.mockReset(); });

describe("U-SALVAR — estado de salvamento da interface", () => {
    it("não salva sem resultado", async () => {
        const hook = await mountHook(useSaveMatch, null);
        expect(hook.current.status).toBe("guest");
        expect(service.save).not.toHaveBeenCalled();
    });
    it("informa serviço indisponível sem tentar salvar", async () => {
        service.configured = false;
        const hook = await mountHook(useSaveMatch, record);
        expect(hook.current.status).toBe("unavailable");
        expect(service.save).not.toHaveBeenCalled();
    });
    it("mostra saving enquanto aguarda e saved após sucesso", async () => {
        let resolve!: () => void;
        service.save.mockImplementation(() => new Promise<void>((done) => { resolve = done; }));
        const hook = await mountHook(useSaveMatch, record);
        expect(hook.current.status).toBe("saving");
        expect(service.save).toHaveBeenCalledExactlyOnceWith(record);
        await act(async () => resolve());
        expect(hook.current.status).toBe("saved");
        await hook.rerender(record);
        expect(service.save).toHaveBeenCalledTimes(1);
    });
    it("informa erro e permite nova tentativa", async () => {
        service.save.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce();
        const hook = await mountHook(useSaveMatch, record);
        expect(hook.current.status).toBe("error");
        await act(async () => hook.current.retry());
        expect(hook.current.status).toBe("saved");
        expect(service.save).toHaveBeenCalledTimes(2);
    });
    it("ignora a resposta antiga quando a partida muda", async () => {
        let finishOld!: () => void, finishNew!: () => void;
        service.save.mockImplementationOnce(() => new Promise<void>((done) => { finishOld = done; }))
            .mockImplementationOnce(() => new Promise<void>((done) => { finishNew = done; }));
        const hook = await mountHook<MatchRecord | null, ReturnType<typeof useSaveMatch>>(useSaveMatch, record);
        await hook.rerender({ ...record, id: "partida-2" });
        await act(async () => finishOld());
        expect(hook.current.status).toBe("saving");
        await act(async () => finishNew());
        expect(hook.current.status).toBe("saved");
        await hook.rerender(null);
        expect(hook.current.status).toBe("guest");
    });
});
