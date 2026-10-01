import { useEffect, useState } from "react";
import type { MatchRecord } from "../types/matchHistory";
import { useMatchHistoryService } from "../stores/MatchHistoryContext";

export function useSaveMatch(record: MatchRecord | null) {
    const service = useMatchHistoryService();
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<{ id: string; status: "saved" | "error" } | null>(null);
    useEffect(() => {
        if (!record || !service.configured) return;
        let cancelled = false;
        setState(null);
        void service.save(record).then(() => {
            if (!cancelled) setState({ id: record.id, status: "saved" });
        }).catch(() => {
            if (!cancelled) setState({ id: record.id, status: "error" });
        });
        return () => { cancelled = true; };
    }, [record, service, attempt]);
    return {
        status: !record ? "guest" : !service.configured ? "unavailable" : state?.id === record.id ? state.status : "saving",
        retry: () => setAttempt((value) => value + 1),
    };
}
