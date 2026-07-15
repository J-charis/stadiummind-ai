import type { AIAgentResponse } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { GeminiService } from '@/services/ai/geminiService';
import { buildGeminiRequest } from '@/services/ai/promptLoader';
import { parseGeminiJson } from '@/services/ai/responseParser';
import { validateAgentResponse } from '@/services/ai/schemas';
import { fallbackVolunteerCoordination } from '@/services/ai/fallbackEngine';

/**
 * Volunteer Coordination Agent — GenAI Architecture Addendum §3.4.
 * Assigns/prioritizes tasks and generates contextual guidance grounded in
 * the actual task location and current volunteer availability.
 */
export async function runVolunteerCoordinationAgent(
  gemini: GeminiService,
  context: OperationalContext,
): Promise<AIAgentResponse> {
  const operationalData = {
    tasks: context.tasks,
    volunteerAvailability: context.volunteerAvailability,
  };

  try {
    const request = buildGeminiRequest('volunteer_coordination', context, operationalData);
    const raw = await gemini.generate(request);
    const parsed = parseGeminiJson(raw.text);
    const validated = validateAgentResponse(parsed);
    if (validated) return { ...validated, isFallback: raw.isMocked ? validated.isFallback : false };
    return fallbackVolunteerCoordination(context);
  } catch {
    return fallbackVolunteerCoordination(context);
  }
}
