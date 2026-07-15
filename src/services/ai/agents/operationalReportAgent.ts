import type { AIAgentResponse, OperationalReportPayload } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { GeminiService } from '@/services/ai/geminiService';
import { buildGeminiRequest } from '@/services/ai/promptLoader';
import { parseGeminiJson } from '@/services/ai/responseParser';
import { validateAgentResponse } from '@/services/ai/schemas';
import { fallbackOperationalReport } from '@/services/ai/fallbackEngine';

export type ReportType = OperationalReportPayload['reportType'];

/**
 * Operational Report Agent — GenAI Architecture Addendum §3.6.
 * Generates Situation Reports, Operational Briefings, Decision Summaries,
 * Shift Handover Reports, and Post-Match Reports — all synthesized from the
 * live OperationalContext, never from static template text.
 */
export async function runOperationalReportAgent(
  gemini: GeminiService,
  context: OperationalContext,
  reportType: ReportType,
): Promise<AIAgentResponse> {
  const operationalData = {
    reportType,
    incidents: context.incidents,
    tasks: context.tasks,
    recentTimeline: context.recentTimeline,
    simulation: context.simulation,
    overallRiskTier: context.overallRiskTier,
  };

  try {
    const request = buildGeminiRequest('operational_report', context, operationalData);
    const raw = await gemini.generate(request);
    const parsed = parseGeminiJson(raw.text);
    const validated = validateAgentResponse(parsed);
    if (validated) return { ...validated, isFallback: raw.isMocked ? validated.isFallback : false };
    return fallbackOperationalReport(context, reportType);
  } catch {
    return fallbackOperationalReport(context, reportType);
  }
}
