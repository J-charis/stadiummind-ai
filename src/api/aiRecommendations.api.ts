import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { runAIOrchestrator } from '@/services/ai/orchestrator';
import { useCurrentOperationalContext } from '@/api/useCurrentOperationalContext';
import { useSimulationSnapshot } from '@/api/simulationSnapshot.api';
import { useSimulationStore } from '@/store/simulationStore';
import { useRecommendationHistoryStore } from '@/store/recommendationHistoryStore';
import { useUIStore } from '@/store/uiStore';
import { mockRecommendations } from '@/services/mock/operations.mock';

/**
 * Reads AI-generated recommendations by running the full pipeline off the
 * single shared OperationalContext (useCurrentOperationalContext) — builds
 * context once, invokes the AI Orchestrator (Crowd Intelligence →
 * Navigation → Operational Report), and records the result into
 * recommendation history. Falls back to static baseline recommendations
 * before context is available so Command Center never appears empty.
 */
export function useAIRecommendations() {
  const context = useCurrentOperationalContext();
  const snapshot = useSimulationSnapshot();
  const pushTimelineEntry = useSimulationStore((s) => s.pushTimelineEntry);
  const recordBatch = useRecommendationHistoryStore((s) => s.recordBatch);
  const setAgentThinking = useUIStore((s) => s.setAgentThinking);

  return useQuery({
    queryKey: [...queryKeys.recommendations, snapshot?.elapsedMinutes ?? 'baseline'],
    queryFn: async () => {
      if (!context) return mockRecommendations;

      setAgentThinking(true);
      try {
        const result = await runAIOrchestrator(context);
        recordBatch(result.recommendations);

        if (snapshot && (snapshot.riskTier === 'high' || snapshot.riskTier === 'critical')) {
          pushTimelineEntry({
            timestamp: new Date().toISOString(),
            label: `AI recommends: ${result.recommendations[0]?.summary ?? 'reviewing options'}`,
            kind: 'ai_recommendation',
          });
        }
        if (snapshot && snapshot.tasks.length > 0) {
          pushTimelineEntry({
            timestamp: new Date().toISOString(),
            label: `Volunteer task generated: ${snapshot.tasks[0].title}`,
            kind: 'volunteer_task',
          });
        }

        return result.recommendations;
      } finally {
        setAgentThinking(false);
      }
    },
    enabled: Boolean(context),
  });
}
