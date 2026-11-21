// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { getInitials, sortCapturedPieces } from "../../../interface/utils/AuxFunctions";
import { getAuthErrorMessage } from "../../../interface/services/authErrors";
import { aiThinkTime } from "../../../interface/utils/aiDelay";
import type { PieceType } from "../../../interface/types/pieces";

describe("U-AUX — identificação e peças capturadas", () => {
    it.each([["Ana Silva", "AS"], ["  ana   maria silva ", "AM"], ["José", "J"], ["", ""]])(
        "extrai iniciais de '%s'", (name, expected) => { expect(getInitials(name)).toBe(expected); });
    it("ordena as peças sem alterar o array recebido", () => {
        const input: PieceType[] = ["king", "queen", "pawn", "rook", "bishop", "knight", "pawn"];
        const before = [...input];
        expect(sortCapturedPieces(input)).toEqual(["pawn", "pawn", "knight", "bishop", "rook", "queen", "king"]);
        expect(input).toEqual(before);
    });
});

describe("U-AUTH — mensagens de erro, sem chamadas ao Firebase", () => {
    it.each([
        ["auth/popup-closed-by-user", "O acesso foi cancelado."],
        ["auth/cancelled-popup-request", "O acesso foi cancelado."],
        ["auth/popup-blocked", "O navegador bloqueou"],
        ["auth/network-request-failed", "Verifique sua conexão"],
        ["auth/account-exists-with-different-credential", "outra forma de acesso"],
        ["auth/user-disabled", "Esta conta está desativada"],
        ["auth/unauthorized-domain", "continuar jogando como visitante"],
        ["auth/operation-not-allowed", "continuar jogando como visitante"],
        ["auth/invalid-api-key", "continuar jogando como visitante"],
        ["auth/configuration-not-found", "continuar jogando como visitante"],
    ])("traduz %s em orientação para o jogador", (code, message) => {
        expect(getAuthErrorMessage({ code })).toContain(message);
    });
    it.each([null, undefined, "erro", {}, new Error("segredo interno")])("trata erros desconhecidos sem expor detalhes (%s)", (error) => {
        expect(getAuthErrorMessage(error)).toBe("Não foi possível concluir a operação. Tente novamente.");
    });
});

describe("U-ESPERA — atraso visual da interface, sem executar busca de IA", () => {
    it("apresenta lance forçado rapidamente", () => { expect(aiThinkTime("hard", 30, 1, 0.9)).toBe(400); });
    it.each([
        ["easy", 600, 1800], ["medium", 1000, 3000], ["hard", 1500, 4500],
    ] as const)("respeita a faixa de espera de %s", (level, min, max) => {
        expect(aiThinkTime(level, 10, 20, 0)).toBe(min);
        expect(aiThinkTime(level, 10, 20, 1)).toBe(max);
        expect(aiThinkTime(level, 0, 20, 0)).toBe(min / 2);
    });
});
