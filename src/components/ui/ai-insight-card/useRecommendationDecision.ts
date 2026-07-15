import { useRecommendationHistoryStore } from '@/store/recommendationHistoryStore';
import { useSimulationStore } from '@/store/simulationStore';
import type { AIAgentResponse } from '@/types/ai';

/**
 * Encapsulates the approve/reject decision flow shared by every AIInsightCard:
 * records the decision in recommendationHistoryStore and documents it on the
 * operational timeline (implementation milestone §11).
 */
export function useRecommendationDecision(response: AIAgentResponse) {
  const approvedIds = useRecommendationHistoryStore((s) => s.approvedIds);
  const rejectedIds = useRecommendationHistoryStore((s) => s.rejectedIds);
  const approve = useRecommendationHistoryStore((s) => s.approve);
  const reject = useRecommendationHistoryStore((s) => s.reject);
  const pushTimelineEntry = useSimulationStore((s) => s.pushTimelineEntry);

  const isApproved = approvedIds.has(response.id);
  const isRejected = rejectedIds.has(response.id);

  function handleApprove() {
    approve(response.id);
    pushTimelineEntry({
      timestamp: new Date().toISOString(),
      label: `Recommendation approved: ${response.summary}`,
      kind: 'ai_recommendation',
    });
  }

  function handleReject() {
    reject(response.id);
    pushTimelineEntry({
      timestamp: new Date().toISOString(),
      label: `Recommendation dismissed: ${response.summary}`,
      kind: 'ai_recommendation',
    });
  }

  return { isApproved, isRejected, handleApprove, handleReject };
}
