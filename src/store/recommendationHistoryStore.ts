import { create } from 'zustand';
import type { AIAgentResponse } from '@/types/ai';

// Recommendation history persistence — Addendum §2/§9 "Persist recommendation
// history". Client-side ring buffer standing in for the ai_recommendations
// table (Blueprint §7) until Supabase writes are wired in Day 3+.

interface RecommendationHistoryState {
  history: AIAgentResponse[];
  approvedIds: Set<string>;
  rejectedIds: Set<string>;
  recordBatch: (responses: AIAgentResponse[]) => void;
  approve: (id: string) => void;
  reject: (id: string) => void;
}

const MAX_HISTORY = 200;

export const useRecommendationHistoryStore = create<RecommendationHistoryState>((set) => ({
  history: [],
  approvedIds: new Set(),
  rejectedIds: new Set(),
  recordBatch: (responses) =>
    set((state) => ({
      history: [...responses, ...state.history].slice(0, MAX_HISTORY),
    })),
  approve: (id) =>
    set((state) => {
      const next = new Set(state.approvedIds);
      next.add(id);
      return { approvedIds: next };
    }),
  reject: (id) =>
    set((state) => {
      const next = new Set(state.rejectedIds);
      next.add(id);
      return { rejectedIds: next };
    }),
}));
