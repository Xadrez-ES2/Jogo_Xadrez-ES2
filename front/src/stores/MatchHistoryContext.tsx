import { createContext, useContext, type ReactNode } from "react";
import type { MatchHistoryService } from "../types/matchHistory";
import { matchHistoryService } from "../services/matchHistory";

const MatchHistoryContext = createContext(matchHistoryService);
export function MatchHistoryProvider({ children, service }: { children: ReactNode; service: MatchHistoryService }) {
    return <MatchHistoryContext.Provider value={service}>{children}</MatchHistoryContext.Provider>;
}
export function useMatchHistoryService() { return useContext(MatchHistoryContext); }
