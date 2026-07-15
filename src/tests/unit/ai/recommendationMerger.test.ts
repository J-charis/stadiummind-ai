import { describe, it, expect } from 'vitest';
import { mergeRecommendations } from '@/services/ai/recommendationMerger';
import type { AIAgentResponse } from '@/types/ai';

function makeResponse(overrides: Partial<AIAgentResponse>): AIAgentResponse {
  return {
    id: overrides.id ?? 'rec-1',
    agentType: 'crowd_intelligence',
    summary: 'Test recommendation',
    reasoning: 'Test reasoning',
    confidenceScore: 0.5,
    operationalImpact: { metric: 'congestion', projectedChange: 'stable', etaMinutes: 0 },
    alternativeActions: [],
    potentialRisks: [],
    expectedOutcome: 'Test outcome',
    riskTier: 'medium',
    createdAt: new Date().toISOString(),
    payload: {},
    isFallback: false,
    ...overrides,
  };
}

describe('mergeRecommendations', () => {
  it('ranks a critical-risk recommendation above a low-risk one regardless of input order', () => {
    const low = makeResponse({ id: 'low', riskTier: 'low', confidenceScore: 0.9 });
    const critical = makeResponse({ id: 'critical', riskTier: 'critical', confidenceScore: 0.5 });

    const merged = mergeRecommendations([low, critical]);
    expect(merged[0].id).toBe('critical');
  });

  it('ranks by confidence as a tiebreaker within the same risk tier', () => {
    const lowConfidence = makeResponse({ id: 'low-conf', riskTier: 'high', confidenceScore: 0.4 });
    const highConfidence = makeResponse({ id: 'high-conf', riskTier: 'high', confidenceScore: 0.9 });

    const merged = mergeRecommendations([lowConfidence, highConfidence]);
    expect(merged[0].id).toBe('high-conf');
  });

  it('folds a lower-priority recommendation about the same section into the higher-priority one\'s alternatives instead of showing both', () => {
    const primary = makeResponse({
      id: 'primary',
      riskTier: 'critical',
      confidenceScore: 0.9,
      payload: { sectionId: 'sec-a' },
    });
    const secondary = makeResponse({
      id: 'secondary',
      agentType: 'navigation',
      riskTier: 'low',
      confidenceScore: 0.3,
      payload: { sectionId: 'sec-a' },
    });

    const merged = mergeRecommendations([secondary, primary]);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('primary');
    expect(merged[0].alternativeActions.some((a) => a.id === 'folded-secondary')).toBe(true);
  });

  it('does not merge recommendations concerning different sections', () => {
    const sectionA = makeResponse({ id: 'a', payload: { sectionId: 'sec-a' } });
    const sectionB = makeResponse({ id: 'b', payload: { sectionId: 'sec-b' } });

    const merged = mergeRecommendations([sectionA, sectionB]);
    expect(merged).toHaveLength(2);
  });

  it('does not merge recommendations that carry no sectionId in their payload (e.g. operational reports)', () => {
    const reportA = makeResponse({ id: 'report-a', agentType: 'operational_report', payload: {} });
    const reportB = makeResponse({ id: 'report-b', agentType: 'operational_report', payload: {} });

    const merged = mergeRecommendations([reportA, reportB]);
    expect(merged).toHaveLength(2);
  });

  it('returns an empty array for empty input without throwing', () => {
    expect(mergeRecommendations([])).toEqual([]);
  });

  it('does not mutate the original input array', () => {
    const input = [makeResponse({ id: 'a', riskTier: 'low' }), makeResponse({ id: 'b', riskTier: 'high' })];
    const inputCopy = [...input];
    mergeRecommendations(input);
    expect(input).toEqual(inputCopy);
  });
});
