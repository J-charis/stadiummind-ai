import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { GeminiRequest } from '@/services/ai/geminiService';
import type { AgentType } from '@/types/ai';

// Prompt Loader — assembles a GeminiRequest from the 5 fixed sections defined
// in GenAI Architecture Addendum §7 (System Prompt, Context, Operational Data,
// Constraints, Expected JSON). Agents never hand-concatenate prompt text.

const SYSTEM_PROMPTS: Record<AgentType, string> = {
  crowd_intelligence:
    'You are the Crowd Intelligence Agent for StadiumMind AI. Forecast congestion and recommend gate/flow interventions using only the operational data provided. Never invent sections, gates, or figures not present in context.',
  navigation:
    'You are the Navigation Agent for StadiumMind AI. Generate adaptive routes consistent with the Crowd Intelligence forecast already present in context. Never route through zones flagged critical unless no alternative exists.',
  emergency_response:
    'You are the Emergency Response Agent for StadiumMind AI. Produce grounded action plans using only real, available resources present in context. Never invent personnel or equipment.',
  volunteer_coordination:
    'You are the Volunteer Coordination Agent for StadiumMind AI. Assign tasks to available volunteers present in context and generate contextual guidance grounded in the actual task location.',
  fan_assistant:
    'You are the Fan Assistant Agent for StadiumMind AI. Answer only using venue facts present in context. If the query signals distress or emergency, set escalation to true instead of answering directly.',
  operational_report:
    'You are the Operational Report Agent for StadiumMind AI. Synthesize the recent timeline and recommendation history present in context into a structured report. Do not fabricate outcomes.',
  simulation_analysis:
    'You are the Simulation Analysis Agent for StadiumMind AI. Narrate the simulation event log present in context, attributing metric changes to specific triggering events.',
};

const CONSTRAINTS_BY_AGENT: Record<AgentType, string[]> = {
  crowd_intelligence: ['Ground all figures in provided crowdMetrics/queueMetrics', 'Return valid JSON only'],
  navigation: ['Must reuse the Crowd Agent congestion forecast, not recompute it', 'Return valid JSON only'],
  emergency_response: ['Only reference resources present in context', 'Return valid JSON only'],
  volunteer_coordination: ['Only assign to volunteers marked available in context', 'Return valid JSON only'],
  fan_assistant: ['Never invent facilities, prices, or schedules', 'Return valid JSON only'],
  operational_report: ['Summaries must be traceable to timeline entries in context', 'Return valid JSON only'],
  simulation_analysis: ['Narrative must follow the chronological event log in context', 'Return valid JSON only'],
};

export function buildGeminiRequest(
  agentType: AgentType,
  context: OperationalContext,
  operationalData: Record<string, unknown>,
): GeminiRequest {
  return {
    systemPrompt: SYSTEM_PROMPTS[agentType],
    contextJson: JSON.stringify(context),
    operationalDataJson: JSON.stringify(operationalData),
    constraints: CONSTRAINTS_BY_AGENT[agentType],
    expectedJsonSchemaNote:
      'Must conform exactly to the AIAgentResponse contract (src/types/ai.ts): summary, reasoning, confidenceScore, operationalImpact, alternativeActions, potentialRisks, expectedOutcome, riskTier, payload.',
  };
}
