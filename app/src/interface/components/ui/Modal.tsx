import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
}

export function Modal({ title, children, onClose }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        dialog?.showModal();
        return () => {
            dialog?.close();
            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
                previousFocus.focus();
            }
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => { event.preventDefault(); onClose(); }}
            className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-6 text-text-primary shadow-2xl backdrop:bg-black/70"
        >
            <h2 id={titleId} className="font-display text-2xl font-semibold">{title}</h2>
            {children}
        </dialog>
    );
}
