import { useMutation } from '@tanstack/react-query';
import { runEmergencyResponseAgent } from '@/services/ai/agents/emergencyResponseAgent';
import { resolveGeminiService } from '@/services/ai/geminiService';
import { useCurrentOperationalContext } from '@/api/useCurrentOperationalContext';
import { useRecommendationHistoryStore } from '@/store/recommendationHistoryStore';
import { useSimulationStore } from '@/store/simulationStore';
import type { Incident } from '@/types/domain';

const gemini = resolveGeminiService(() => 'MOCK_RESPONSE_NOT_YET_SCHEMA_COMPLIANT');

/** Generates an Emergency Response Agent action plan for a specific incident (§5). */
export function useEmergencyResponse() {
  const context = useCurrentOperationalContext();
  const recordBatch = useRecommendationHistoryStore((s) => s.recordBatch);
  const pushTimelineEntry = useSimulationStore((s) => s.pushTimelineEntry);

  return useMutation({
    mutationFn: async (incident: Incident) => {
      if (!context) throw new Error('Operational context is not ready yet.');
      const response = await runEmergencyResponseAgent(gemini, context, incident);
      recordBatch([response]);
      pushTimelineEntry({
        timestamp: new Date().toISOString(),
        label: `Emergency Response Agent: ${response.summary}`,
        kind: 'ai_recommendation',
      });
      return response;
    },
  });
}
