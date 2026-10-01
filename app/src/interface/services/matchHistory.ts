import { firebaseAuthService, getFirebaseClient } from "./firebaseAuth";
import type { MatchHistoryService, MatchRecord } from "../types/matchHistory";

const enabled = import.meta.env?.VITE_FIRESTORE_ENABLED === "true";

function parseRecord(id: string, uid: string, data: Record<string, unknown>): MatchRecord {
    if (data.ownerUid !== uid || typeof data.endedAt !== "number" || !Number.isFinite(data.endedAt) || data.endedAt <= 0 || data.endedAt > 8_640_000_000_000_000
        || !["victory", "defeat", "draw"].includes(String(data.outcome))
        || !["easy", "medium", "hard", "not-set"].includes(String(data.difficulty))
        || !["resignation", "timeout", "checkmate", "draw"].includes(String(data.reasonCode))
        || typeof data.reason !== "string" || typeof data.opponent !== "string") {
        throw new Error("Registro de partida inválido.");
    }
    return { id, ownerUid: uid, endedAt: data.endedAt, outcome: data.outcome as MatchRecord["outcome"],
        difficulty: data.difficulty as MatchRecord["difficulty"], reasonCode: data.reasonCode as MatchRecord["reasonCode"], reason: data.reason, opponent: data.opponent };
}

export const matchHistoryService: MatchHistoryService = {
    configured: firebaseAuthService.configured && enabled,
    subscribe(uid, onRecords, onError) {
        let cancelled = false;
        let unsubscribe: (() => void) | undefined;
        void Promise.all([getFirebaseClient(), import("firebase/firestore")]).then(([client, sdk]) => {
            if (cancelled) return;
            if (client.auth.currentUser?.uid !== uid) throw new Error("Sessão alterada.");
            const query = sdk.query(sdk.collection(sdk.getFirestore(client.app), "users", uid, "matches"), sdk.orderBy("endedAt", "desc"));
            unsubscribe = sdk.onSnapshot(query, (snapshot) => {
                if (cancelled) return;
                try { onRecords(snapshot.docs.map((doc) => parseRecord(doc.id, uid, doc.data()))); }
                catch (error) { onError(error); }
            }, onError);
        }).catch((error: unknown) => { if (!cancelled) onError(error); });
        return () => { cancelled = true; unsubscribe?.(); };
    },
    async save(record) {
        const [client, sdk] = await Promise.all([getFirebaseClient(), import("firebase/firestore")]);
        if (client.auth.currentUser?.uid !== record.ownerUid) throw new Error("Sessão alterada.");
        const reference = sdk.doc(sdk.getFirestore(client.app), "users", record.ownerUid, "matches", record.id);
        await sdk.runTransaction(sdk.getFirestore(client.app), async (transaction) => {
            const existing = await transaction.get(reference);
            if (existing.exists()) {
                const previous = parseRecord(existing.id, record.ownerUid, existing.data());
                if (JSON.stringify(previous) !== JSON.stringify(parseRecord(record.id, record.ownerUid, { ...record }))) {
                    throw new Error("Esta partida já possui um resultado definitivo.");
                }
                return;
            }
            const { id: _id, ...data } = record;
            transaction.set(reference, { ...data, savedAt: sdk.serverTimestamp() });
        });
    },
};
