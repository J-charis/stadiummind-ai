import type { AIAgentResponse } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { GeminiService } from '@/services/ai/geminiService';
import { buildGeminiRequest } from '@/services/ai/promptLoader';
import { parseGeminiJson } from '@/services/ai/responseParser';
import { validateAgentResponse } from '@/services/ai/schemas';
import { fallbackFanAssistant } from '@/services/ai/fallbackEngine';

/**
 * Fan Assistant Agent — GenAI Architecture Addendum §3.5. Multilingual,
 * grounded venue Q&A: seating, food, restrooms, parking, accessibility,
 * emergency help, lost & found, match info, queue recommendations. Answers
 * are constrained to venue facts present in context; distress/emergency
 * language triggers escalation instead of a direct answer.
 *
 * Problem-statement pillar: Multi-language Assistance — see
 * PROBLEM_STATEMENT_ALIGNMENT.md §4.
 */
export async function runFanAssistantAgent(
  gemini: GeminiService,
  context: OperationalContext,
  query: string,
  locale: string,
): Promise<AIAgentResponse> {
  const operationalData = {
    query,
    locale,
    sections: context.sections,
    gates: context.gates,
    queueMetrics: context.queueMetrics,
  };

  try {
    const request = buildGeminiRequest('fan_assistant', context, operationalData);
    const raw = await gemini.generate(request);
    const parsed = parseGeminiJson(raw.text);
    const validated = validateAgentResponse(parsed);
    if (validated) return { ...validated, isFallback: raw.isMocked ? validated.isFallback : false };
    return fallbackFanAssistant(context, query, locale);
  } catch {
    return fallbackFanAssistant(context, query, locale);
  }
}
