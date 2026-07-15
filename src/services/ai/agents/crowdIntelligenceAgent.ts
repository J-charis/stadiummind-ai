import type { AIAgentResponse } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { GeminiService } from '@/services/ai/geminiService';
import { buildGeminiRequest } from '@/services/ai/promptLoader';
import { parseGeminiJson } from '@/services/ai/responseParser';
import { validateAgentResponse } from '@/services/ai/schemas';
import { fallbackCrowdIntelligence } from '@/services/ai/fallbackEngine';

/**
 * Crowd Intelligence Agent — GenAI Architecture Addendum §3.1.
 * Produces congestion forecast, risk score, predicted queue growth, and
 * recommended gate interventions. Falls back deterministically on failure.
 *
 * Problem-statement pillar: Dynamic Crowd Management — see
 * PROBLEM_STATEMENT_ALIGNMENT.md §1.
 */
export async function runCrowdIntelligenceAgent(
  gemini: GeminiService,
  context: OperationalContext,
): Promise<AIAgentResponse> {
  const operationalData = {
    crowdMetrics: context.crowdMetrics,
    queueMetrics: context.queueMetrics,
    gates: context.gates,
  };

  try {
    const request = buildGeminiRequest('crowd_intelligence', context, operationalData);
    const raw = await gemini.generate(request);
    const parsed = parseGeminiJson(raw.text);
    const validated = validateAgentResponse(parsed);
    if (validated) return { ...validated, isFallback: raw.isMocked ? validated.isFallback : false };
    return fallbackCrowdIntelligence(context);
  } catch {
    return fallbackCrowdIntelligence(context);
  }
}
