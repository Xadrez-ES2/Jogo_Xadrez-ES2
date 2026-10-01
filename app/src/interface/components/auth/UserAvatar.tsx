import { useState } from "react";
import { getInitials } from "../../utils/AuxFunctions";

export function UserAvatar({ name, photoURL, large = false }: { name: string; photoURL: string | null; large?: boolean }) {
    const [failedURL, setFailedURL] = useState<string | null>(null);
    return (
        <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-alt font-semibold text-accent ${large ? "h-20 w-20 text-2xl" : "h-8 w-8 text-xs"}`} aria-hidden="true">
            {photoURL && photoURL !== failedURL ? (
                <img src={photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setFailedURL(photoURL)} />
            ) : getInitials(name)}
        </span>
    );
}
