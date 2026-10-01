import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { Game } from "../src/pages/Game";
import { GameResultModal } from "../src/components/GameResultModal";
import { type GameResult, resultTitles } from "../src/types/gameResult";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { url: "http://localhost" });
Object.assign(globalThis, {
    React,
    window: dom.window, document: dom.window.document,
    HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true,
});
// JSDOM não implementa a camada modal nativa do navegador.
dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };

function button(label: string) {
    const element = [...document.querySelectorAll("button")].find((item) => item.textContent === label);
    assert.ok(element, `Botão ausente: ${label}`);
    return element;
}

async function click(element: HTMLElement) {
    await act(() => element.click());
}

test("desistência: cancelar, Escape, confirmar, bloquear tabuleiro e reiniciar", async () => {
    const root = createRoot(document.getElementById("root")!);
    await act(() => root.render(<MemoryRouter><Game /></MemoryRouter>));
    try {
        const square = document.querySelector<HTMLButtonElement>('[aria-label^="Casa e2,"]')!;
        await click(square);
        assert.equal(square.getAttribute("aria-pressed"), "true");
        await click(button("Desistir da partida"));
        assert.equal(document.querySelector("dialog")?.open, true);
        await click(button("Continuar jogando"));
        assert.equal(document.querySelector("dialog"), null);
        assert.equal(square.disabled, false);
        assert.equal(square.getAttribute("aria-pressed"), "true");

        await click(button("Desistir da partida"));
        await act(() => { document.querySelector("dialog")!.dispatchEvent(new dom.window.Event("cancel", { cancelable: true })); });
        assert.equal(document.querySelector("dialog"), null);
        await click(button("Desistir da partida"));
        await click(button("Confirmar desistência"));
        assert.match(document.body.textContent!, /Partida encerrada · Derrota/);
        assert.match(document.body.textContent!, /Você desistiu/);
        assert.equal(document.querySelector("dialog h2")?.textContent, "Derrota");
        await click(button("Ver tabuleiro"));
        assert.equal(document.querySelector("dialog"), null);
        const squares = [...document.querySelectorAll<HTMLButtonElement>('[aria-label^="Casa "]')];
        assert.equal(squares.length, 64);
        assert.ok(squares.every((item) => item.disabled && item.getAttribute("aria-pressed") === "false"));
        await click(square);
        assert.equal(square.getAttribute("aria-pressed"), "false");
        await click(button("Ver resultado"));
        assert.equal(document.querySelector("dialog")?.open, true);
        await act(() => { document.querySelector("dialog")!.dispatchEvent(new dom.window.Event("cancel", { cancelable: true })); });
        assert.equal(square.disabled, true);
        await click(button("Nova partida"));
        assert.equal(square.disabled, false);
        assert.doesNotMatch(document.body.textContent!, /Partida encerrada/);
        await click(square);
        assert.equal(square.getAttribute("aria-pressed"), "true");
        await click(button("Desistir da partida"));
        await click(button("Confirmar desistência"));
        await click(button("Jogar novamente"));
        assert.equal(document.querySelector("dialog"), null);
        assert.equal(square.disabled, false);
    } finally {
        await act(() => root.unmount());
    }
});

test("pausa preserva seleção e anotações, bloqueia interação e permite retomada", async () => {
    const root = createRoot(document.getElementById("root")!);
    await act(() => root.render(<MemoryRouter><Game /></MemoryRouter>));
    try {
        const selected = document.querySelector<HTMLButtonElement>('[aria-label^="Casa e2,"]')!;
        const annotated = document.querySelector<HTMLButtonElement>('[aria-label^="Casa d4,"]')!;
        const target = document.querySelector<HTMLButtonElement>('[aria-label^="Casa e4,"]')!;
        const annotate = async (square: HTMLElement) => {
            await act(() => {
                square.dispatchEvent(new dom.window.MouseEvent("mousedown", { button: 2, bubbles: true }));
                square.dispatchEvent(new dom.window.MouseEvent("mouseup", { button: 2, bubbles: true }));
            });
        };
        await click(selected);
        await annotate(annotated);
        assert.ok(annotated.querySelector(".bg-danger"));
        await click(button("Pausar partida"));
        assert.match(document.querySelector('[role="status"]')!.textContent!, /Partida pausada/);
        assert.equal(button("Retomar partida").getAttribute("aria-pressed"), "true");
        assert.equal(document.querySelectorAll('[aria-label^="Casa "]:disabled').length, 64);
        await click(target);
        await annotate(annotated);
        await annotate(target);
        assert.equal(selected.getAttribute("aria-pressed"), "true");
        assert.equal(target.getAttribute("aria-pressed"), "false");
        assert.ok(annotated.querySelector(".bg-danger"));
        assert.equal(target.querySelector(".bg-danger"), null);

        await click(button("Retomar partida"));
        assert.equal(document.querySelector('[role="status"]'), null);
        assert.equal(button("Pausar partida").getAttribute("aria-pressed"), "false");
        assert.equal(document.querySelectorAll('[aria-label^="Casa "]:disabled').length, 0);
        assert.equal(selected.getAttribute("aria-pressed"), "true");
        assert.ok(annotated.querySelector(".bg-danger"));
        await click(target);
        assert.equal(target.getAttribute("aria-pressed"), "true");
        assert.equal(annotated.querySelector(".bg-danger"), null);

        // Cancelar desistência mantém a pausa; confirmar encerra e limpa a pausa.
        await click(button("Pausar partida"));
        await click(button("Desistir da partida"));
        await click(button("Continuar jogando"));
        assert.equal(target.disabled, true);
        button("Retomar partida");
        await click(button("Desistir da partida"));
        await click(button("Confirmar desistência"));
        assert.equal([...document.querySelectorAll("button")].some((item) => item.textContent === "Retomar partida"), false);
        await click(button("Jogar novamente"));
        assert.equal(target.disabled, false);
        assert.equal(button("Pausar partida").getAttribute("aria-pressed"), "false");
    } finally {
        await act(() => root.unmount());
    }
});

for (const outcome of ["victory", "defeat", "draw"] as const) {
    test(`pop-up apresenta ${resultTitles[outcome]} e suas ações`, async () => {
        const root = createRoot(document.getElementById("root")!);
        let closed = 0;
        let restarted = 0;
        const result: GameResult = { outcome, reason: "Motivo fornecido pelo estado da partida." };
        await act(() => root.render(
            <MemoryRouter><GameResultModal result={result} onClose={() => { closed++; }} onRestart={() => { restarted++; }} /></MemoryRouter>
        ));
        try {
            assert.equal(document.querySelector("dialog")?.open, true);
            assert.equal(document.querySelector("dialog h2")?.textContent, resultTitles[outcome]);
            assert.match(document.querySelector("dialog")!.textContent!, /Motivo fornecido/);
            assert.equal(document.querySelector("dialog a")?.getAttribute("href"), "/");
            await click(button("Ver tabuleiro"));
            assert.equal(closed, 1);
            await click(button("Jogar novamente"));
            assert.equal(restarted, 1);
        } finally {
            await act(() => root.unmount());
        }
    });
}
