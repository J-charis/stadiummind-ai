import { z } from 'zod';

// Zod schema mirroring src/types/ai.ts AIAgentResponse — used by the
// Explainability Layer / Schema Validator (GenAI Addendum §7, §8) to reject
// any agent output missing a required field before it reaches the client.

export const recommendedActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
});

export const operationalImpactSchema = z.object({
  metric: z.string(),
  projectedChange: z.string(),
  etaMinutes: z.number(),
});

export const riskTierSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const agentTypeSchema = z.enum([
  'crowd_intelligence',
  'navigation',
  'emergency_response',
  'volunteer_coordination',
  'fan_assistant',
  'operational_report',
  'simulation_analysis',
]);

export const aiAgentResponseSchema = z.object({
  id: z.string(),
  agentType: agentTypeSchema,
  summary: z.string().min(1),
  reasoning: z.string().min(1),
  confidenceScore: z.number().min(0).max(1),
  operationalImpact: operationalImpactSchema,
  alternativeActions: z.array(recommendedActionSchema),
  potentialRisks: z.array(z.string()),
  expectedOutcome: z.string().min(1),
  riskTier: riskTierSchema,
  createdAt: z.string(),
  payload: z.record(z.string(), z.unknown()),
  isFallback: z.boolean(),
});

export type ValidatedAIAgentResponse = z.infer<typeof aiAgentResponseSchema>;

/**
 * Validates a candidate agent response against the explainability contract.
 * Returns null (never throws) so callers can fall back deterministically.
 */
export function validateAgentResponse(candidate: unknown): ValidatedAIAgentResponse | null {
  const result = aiAgentResponseSchema.safeParse(candidate);
  return result.success ? result.data : null;
}
