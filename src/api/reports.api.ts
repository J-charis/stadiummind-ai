import { useMutation, useQuery } from '@tanstack/react-query';
import { runOperationalReportAgent } from '@/services/ai/agents/operationalReportAgent';
import type { ReportType } from '@/services/ai/agents/operationalReportAgent';
import { resolveGeminiService } from '@/services/ai/geminiService';
import { useCurrentOperationalContext } from '@/api/useCurrentOperationalContext';
import { useRecommendationHistoryStore } from '@/store/recommendationHistoryStore';

const gemini = resolveGeminiService(() => 'MOCK_RESPONSE_NOT_YET_SCHEMA_COMPLIANT');

/**
 * Auto-refreshing Situation Report for the Command Center panel (§9).
 * Regenerates on an interval so the panel visibly updates without user
 * action, standing in for "every few simulation minutes" until the
 * simulation clock emits a dedicated report-tick event.
 */
export function useSituationReport() {
  const context = useCurrentOperationalContext();
  const recordBatch = useRecommendationHistoryStore((s) => s.recordBatch);

  return useQuery({
    queryKey: ['situation-report', context?.generatedAt.slice(0, 16)],
    queryFn: async () => {
      if (!context) return null;
      const report = await runOperationalReportAgent(gemini, context, 'situation');
      recordBatch([report]);
      return report;
    },
    enabled: Boolean(context),
    refetchInterval: 20_000,
  });
}

/** On-demand report generation for Shift Handover and Post-Match reports (§3, §4). */
export function useGenerateReport() {
  const context = useCurrentOperationalContext();
  const recordBatch = useRecommendationHistoryStore((s) => s.recordBatch);

  return useMutation({
    mutationFn: async (reportType: ReportType) => {
      if (!context) throw new Error('Operational context is not ready yet.');
      const report = await runOperationalReportAgent(gemini, context, reportType);
      recordBatch([report]);
      return report;
    },
  });
}
