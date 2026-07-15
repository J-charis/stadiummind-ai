import type { AIAgentResponse } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { GeminiService } from '@/services/ai/geminiService';
import type { Incident } from '@/types/domain';
import { buildGeminiRequest } from '@/services/ai/promptLoader';
import { parseGeminiJson } from '@/services/ai/responseParser';
import { validateAgentResponse } from '@/services/ai/schemas';
import { fallbackEmergencyResponse } from '@/services/ai/fallbackEngine';

/**
 * Emergency Response Agent — GenAI Architecture Addendum §3.3. Supports
 * medical, fire, gate closure, crowd surge, lost child, and power failure
 * incidents. Produces an action plan, resource assignment, response
 * timeline (via operationalImpact.etaMinutes), evacuation guidance, and
 * affected zones — grounded strictly in resources present in context.
 */
export async function runEmergencyResponseAgent(
  gemini: GeminiService,
  context: OperationalContext,
  incident: Incident,
): Promise<AIAgentResponse> {
  const operationalData = {
    incident,
    section: context.sections.find((s) => s.id === incident.sectionId),
    medicalBay: context.sections.find((s) => s.sectionType === 'medical_bay'),
    volunteerAvailability: context.volunteerAvailability,
  };

  try {
    const request = buildGeminiRequest('emergency_response', context, operationalData);
    const raw = await gemini.generate(request);
    const parsed = parseGeminiJson(raw.text);
    const validated = validateAgentResponse(parsed);
    if (validated) return { ...validated, isFallback: raw.isMocked ? validated.isFallback : false };
    return fallbackEmergencyResponse(context, incident);
  } catch {
    return fallbackEmergencyResponse(context, incident);
  }
}
