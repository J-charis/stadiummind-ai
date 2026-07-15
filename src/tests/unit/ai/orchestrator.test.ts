import { describe, it, expect } from 'vitest';
import { runAIOrchestrator } from '@/services/ai/orchestrator';
import { buildOperationalContext } from '@/services/ai/operationalContextBuilder';
import { mockCrowdMetrics, mockQueueMetrics, mockIncidents, mockTasks } from '@/services/mock/operations.mock';
import { aiAgentResponseSchema } from '@/services/ai/schemas';
import type { GeminiService } from '@/services/ai/geminiService';

// The orchestrator is the single entry point for all AI reasoning (Addendum
// §2/§9). These tests use a fake GeminiService — never the real network —
// so they're deterministic and exercise both the "Gemini succeeds" and
// "Gemini fails, Fallback Engine takes over" paths explicitly.

function testContext() {
  return buildOperationalContext({
    crowdMetrics: mockCrowdMetrics,
    queueMetrics: mockQueueMetrics,
    incidents: mockIncidents,
    tasks: mockTasks,
    simulation: { id: null, scenario: null, status: 'idle', elapsedMinutes: 0, intensity: 0, riskTier: 'low' },
    recentTimeline: [],
  });
}

const alwaysFailingGemini: GeminiService = {
  generate: () => Promise.reject(new Error('network down')),
};

const invalidJsonGemini: GeminiService = {
  generate: () => Promise.resolve({ text: 'not valid json at all', isMocked: false }),
};

describe('runAIOrchestrator', () => {
  it('sequences Crowd Intelligence and Navigation Agent and produces a merged, ranked recommendation set', async () => {
    const result = await runAIOrchestrator(testContext(), alwaysFailingGemini);

    expect(result.executedAgents).toEqual(
      expect.arrayContaining(['crowd_intelligence', 'navigation', 'operational_report']),
    );
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('every recommendation returned satisfies the explainability contract', async () => {
    const result = await runAIOrchestrator(testContext(), alwaysFailingGemini);
    for (const rec of result.recommendations) {
      expect(aiAgentResponseSchema.safeParse(rec).success).toBe(true);
    }
  });

  it('falls back deterministically when Gemini throws, and marks those responses as fallback', async () => {
    const result = await runAIOrchestrator(testContext(), alwaysFailingGemini);
    const crowdRec = result.recommendations.find((r) => r.agentType === 'crowd_intelligence');
    expect(crowdRec?.isFallback).toBe(true);
  });

  it('falls back deterministically when Gemini returns unparseable/non-JSON text', async () => {
    const result = await runAIOrchestrator(testContext(), invalidJsonGemini);
    const crowdRec = result.recommendations.find((r) => r.agentType === 'crowd_intelligence');
    expect(crowdRec?.isFallback).toBe(true);
  });

  it('never throws even when Gemini is completely unavailable — resilience is the point', async () => {
    await expect(runAIOrchestrator(testContext(), alwaysFailingGemini)).resolves.toBeDefined();
  });

  it('the Navigation Agent runs after and is informed by the Crowd Intelligence Agent (pipeline ordering)', async () => {
    const calls: string[] = [];
    const orderTrackingGemini: GeminiService = {
      generate: async (request) => {
        calls.push(request.systemPrompt);
        return { text: 'invalid', isMocked: false };
      },
    };

    await runAIOrchestrator(testContext(), orderTrackingGemini);

    const crowdCallIndex = calls.findIndex((p) => p.includes('Crowd Intelligence'));
    const navCallIndex = calls.findIndex((p) => p.includes('Navigation'));
    expect(crowdCallIndex).toBeGreaterThanOrEqual(0);
    expect(navCallIndex).toBeGreaterThan(crowdCallIndex);
  });
});
