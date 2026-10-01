import { useEffect, useState } from "react";
import type { MatchRecord } from "../types/matchHistory";
import { useMatchHistoryService } from "../stores/MatchHistoryContext";

export function useMatchHistory(uid: string | undefined) {
    const service = useMatchHistoryService();
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<{ uid?: string; records: MatchRecord[]; status: "loading" | "ready" | "error" }>({ records: [], status: "loading" });
    useEffect(() => {
        if (!uid || !service.configured) return;
        let cancelled = false;
        setState({ uid, records: [], status: "loading" });
        const unsubscribe = service.subscribe(uid, (records) => {
            if (!cancelled) setState({ uid, records, status: "ready" });
        }, () => {
            if (!cancelled) setState({ uid, records: [], status: "error" });
        });
        return () => { cancelled = true; unsubscribe(); };
    }, [uid, service, attempt]);
    return {
        records: state.uid === uid ? state.records : [],
        status: !service.configured ? "unavailable" : state.uid === uid ? state.status : "loading",
        retry: () => setAttempt((value) => value + 1),
    };
}
