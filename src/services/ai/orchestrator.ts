import type { AIAgentResponse } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import { resolveGeminiService, type GeminiService } from '@/services/ai/geminiService';
import { runCrowdIntelligenceAgent } from '@/services/ai/agents/crowdIntelligenceAgent';
import { runNavigationAgent } from '@/services/ai/agents/navigationAgent';
import { runOperationalReportAgent } from '@/services/ai/agents/operationalReportAgent';
import { mergeRecommendations } from '@/services/ai/recommendationMerger';

// AI Orchestrator — GenAI Architecture Addendum §2, §9.
// Single entry point for all AI reasoning. Never calls Gemini directly from a
// component. Selects agents, sequences dependent calls (Navigation depends on
// Crowd Intelligence), merges + ranks, and returns the final recommendation set.
//
// Problem-statement pillar: Real-Time Decision Support — see
// PROBLEM_STATEMENT_ALIGNMENT.md §3. This is the single pipeline every
// pillar's recommendations flow through before reaching a human decision.

/**
 * Resolves to the live Gemini gateway when Supabase is configured, otherwise
 * a mock that deliberately returns schema-invalid text so every agent call
 * exercises its full fallback path (proving the resilience story, Addendum
 * §7). This is the only place that decides mock vs. live — nothing in the
 * agents, merger, or explainability layer changes either way.
 */
const defaultGemini: GeminiService = resolveGeminiService(() => 'MOCK_RESPONSE_NOT_YET_SCHEMA_COMPLIANT');

export interface OrchestratorResult {
  recommendations: AIAgentResponse[];
  executedAgents: AIAgentResponse['agentType'][];
}

/**
 * Runs the full reasoning pass: Crowd Intelligence → Navigation (dependent) →
 * Operational Report (independent, ambient). Merges + ranks. Persists
 * nothing itself; callers (React Query hooks) own persistence into
 * recommendation history.
 */
export async function runAIOrchestrator(
  context: OperationalContext,
  gemini: GeminiService = defaultGemini,
): Promise<OrchestratorResult> {
  const crowdResponse = await runCrowdIntelligenceAgent(gemini, context);
  const navigationResponse = await runNavigationAgent(gemini, context, crowdResponse);
  const reportResponse = await runOperationalReportAgent(gemini, context, 'situation');

  const merged = mergeRecommendations([crowdResponse, navigationResponse, reportResponse]);

  return {
    recommendations: merged,
    executedAgents: [crowdResponse.agentType, navigationResponse.agentType, reportResponse.agentType],
  };
}
