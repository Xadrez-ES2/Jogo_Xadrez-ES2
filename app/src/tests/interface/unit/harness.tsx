import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, vi } from "vitest";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots = new Set<Root>();

afterEach(async () => {
    await act(async () => { for (const root of roots) root.unmount(); });
    roots.clear();
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
});

export async function render(element: ReactNode) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    roots.add(root);
    const rerender = async (next: ReactNode) => { await act(async () => root.render(next)); };
    await rerender(element);
    return { container, rerender, unmount: async () => {
        await act(async () => root.unmount());
        roots.delete(root);
    } };
}

export async function mountHook<Props, Value>(hook: (props: Props) => Value, props: Props) {
    let current: Value;
    function Probe({ value }: { value: Props }) { current = hook(value); return null; }
    const view = await render(<Probe value={props} />);
    return {
        get current() { return current!; },
        rerender: (value: Props) => view.rerender(<Probe value={value} />),
        unmount: view.unmount,
    };
}

export async function click(element: HTMLElement | null) {
    if (!element) throw new Error("Elemento esperado não encontrado");
    await act(async () => element.click());
}
