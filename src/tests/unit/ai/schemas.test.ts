import { describe, it, expect } from 'vitest';
import { validateAgentResponse } from '@/services/ai/schemas';
import { fallbackCrowdIntelligence } from '@/services/ai/fallbackEngine';
import { buildOperationalContext } from '@/services/ai/operationalContextBuilder';
import { mockCrowdMetrics, mockQueueMetrics, mockIncidents, mockTasks } from '@/services/mock/operations.mock';

// The Schema Validator is what makes the Explainability Layer's promise
// enforceable rather than aspirational: no recommendation reaches the UI
// without every required field (GenAI Addendum §5, §8).

function validContext() {
  return buildOperationalContext({
    crowdMetrics: mockCrowdMetrics,
    queueMetrics: mockQueueMetrics,
    incidents: mockIncidents,
    tasks: mockTasks,
    simulation: { id: null, scenario: null, status: 'idle', elapsedMinutes: 0, intensity: 0, riskTier: 'low' },
    recentTimeline: [],
  });
}

describe('validateAgentResponse', () => {
  it('accepts a well-formed response produced by the Fallback Engine', () => {
    const response = fallbackCrowdIntelligence(validContext());
    expect(validateAgentResponse(response)).not.toBeNull();
  });

  it('rejects a response missing required explainability fields (no reasoning)', () => {
    const response = fallbackCrowdIntelligence(validContext());
    const { reasoning: _drop, ...withoutReasoning } = response;
    expect(validateAgentResponse(withoutReasoning)).toBeNull();
  });

  it('rejects a response missing alternativeActions entirely', () => {
    const response = fallbackCrowdIntelligence(validContext());
    const { alternativeActions: _drop, ...broken } = response;
    expect(validateAgentResponse(broken)).toBeNull();
  });

  it('rejects a confidenceScore outside the valid 0–1 range', () => {
    const response = fallbackCrowdIntelligence(validContext());
    expect(validateAgentResponse({ ...response, confidenceScore: 1.5 })).toBeNull();
    expect(validateAgentResponse({ ...response, confidenceScore: -0.1 })).toBeNull();
  });

  it('rejects an unrecognized agentType', () => {
    const response = fallbackCrowdIntelligence(validContext());
    expect(validateAgentResponse({ ...response, agentType: 'not_a_real_agent' })).toBeNull();
  });

  it('rejects an unrecognized riskTier', () => {
    const response = fallbackCrowdIntelligence(validContext());
    expect(validateAgentResponse({ ...response, riskTier: 'catastrophic' })).toBeNull();
  });

  it('rejects malformed input types outright (string, null, array) without throwing', () => {
    expect(validateAgentResponse('not an object')).toBeNull();
    expect(validateAgentResponse(null)).toBeNull();
    expect(validateAgentResponse([])).toBeNull();
    expect(validateAgentResponse(undefined)).toBeNull();
  });

  it('rejects an empty summary string', () => {
    const response = fallbackCrowdIntelligence(validContext());
    expect(validateAgentResponse({ ...response, summary: '' })).toBeNull();
  });
});
