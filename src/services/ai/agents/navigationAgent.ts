import type { AIAgentResponse } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { GeminiService } from '@/services/ai/geminiService';
import { buildGeminiRequest } from '@/services/ai/promptLoader';
import { parseGeminiJson } from '@/services/ai/responseParser';
import { validateAgentResponse } from '@/services/ai/schemas';
import { fallbackNavigation } from '@/services/ai/fallbackEngine';

/**
 * Navigation Agent — GenAI Architecture Addendum §3.2. Consumes the Crowd
 * Intelligence Agent's forecast as an input constraint rather than
 * recomputing congestion independently (pipeline dependency ordering,
 * Addendum §2).
 *
 * Problem-statement pillar: Smart Indoor Navigation — see
 * PROBLEM_STATEMENT_ALIGNMENT.md §2.
 */
export async function runNavigationAgent(
  gemini: GeminiService,
  context: OperationalContext,
  crowdForecast: AIAgentResponse,
): Promise<AIAgentResponse> {
  const operationalData = {
    gates: context.gates,
    queueMetrics: context.queueMetrics,
    crowdForecast: crowdForecast.payload,
  };

  try {
    const request = buildGeminiRequest('navigation', context, operationalData);
    const raw = await gemini.generate(request);
    const parsed = parseGeminiJson(raw.text);
    const validated = validateAgentResponse(parsed);
    if (validated) return { ...validated, isFallback: raw.isMocked ? validated.isFallback : false };
    return fallbackNavigation(context);
  } catch {
    return fallbackNavigation(context);
  }
}
