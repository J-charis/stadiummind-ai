import type { AIAgentResponse } from '@/types/ai';

// Recommendation Merger — GenAI Architecture Addendum §2, requested §6.
// Deduplicates and ranks agent outputs. Conflicting section-level actions from
// different agents are reconciled by keeping the higher-confidence,
// higher-risk-tier recommendation and folding the other into its alternatives.

const RISK_WEIGHT: Record<AIAgentResponse['riskTier'], number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function priorityScore(response: AIAgentResponse): number {
  return RISK_WEIGHT[response.riskTier] * 10 + response.confidenceScore * 5;
}

function sameSubject(a: AIAgentResponse, b: AIAgentResponse): boolean {
  const aSection = (a.payload as Record<string, unknown>).sectionId;
  const bSection = (b.payload as Record<string, unknown>).sectionId;
  return Boolean(aSection) && aSection === bSection;
}

/**
 * Merges and ranks a set of agent responses. When two responses concern the
 * same subject (e.g. the same section), the lower-priority one is folded into
 * the higher-priority one's alternativeActions instead of being shown twice.
 */
export function mergeRecommendations(responses: AIAgentResponse[]): AIAgentResponse[] {
  const sorted = [...responses].sort((a, b) => priorityScore(b) - priorityScore(a));
  const merged: AIAgentResponse[] = [];

  for (const candidate of sorted) {
    const conflict = merged.find((existing) => sameSubject(existing, candidate));
    if (conflict) {
      conflict.alternativeActions = [
        ...conflict.alternativeActions,
        {
          id: `folded-${candidate.id}`,
          label: candidate.summary,
          description: `Alternative from ${candidate.agentType.replace('_', ' ')}: ${candidate.reasoning}`,
        },
      ];
      continue;
    }
    merged.push(candidate);
  }

  return merged;
}
