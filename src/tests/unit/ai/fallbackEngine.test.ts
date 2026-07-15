import { describe, it, expect } from 'vitest';
import {
  fallbackCrowdIntelligence,
  fallbackNavigation,
  fallbackOperationalReport,
  fallbackEmergencyResponse,
  fallbackVolunteerCoordination,
  fallbackFanAssistant,
} from '@/services/ai/fallbackEngine';
import { buildOperationalContext } from '@/services/ai/operationalContextBuilder';
import { mockCrowdMetrics, mockQueueMetrics, mockIncidents, mockTasks } from '@/services/mock/operations.mock';
import { aiAgentResponseSchema } from '@/services/ai/schemas';
import type { Incident } from '@/types/domain';

// The explainability contract (GenAI Addendum §5) requires every recommendation
// — including fallback ones — to carry summary, reasoning, confidence,
// operational impact, alternatives, risks, and expected outcome. These tests
// assert the Fallback Engine actually honors that contract via the same Zod
// schema the Explainability Layer uses to validate live Gemini output.

function baseContext() {
  return buildOperationalContext({
    crowdMetrics: mockCrowdMetrics,
    queueMetrics: mockQueueMetrics,
    incidents: mockIncidents,
    tasks: mockTasks,
    simulation: { id: null, scenario: null, status: 'idle', elapsedMinutes: 0, intensity: 0, riskTier: 'low' },
    recentTimeline: [],
  });
}

describe('Fallback Engine — explainability contract compliance', () => {
  it('fallbackCrowdIntelligence satisfies the AIAgentResponse schema and is marked as a fallback', () => {
    const response = fallbackCrowdIntelligence(baseContext());
    expect(aiAgentResponseSchema.safeParse(response).success).toBe(true);
    expect(response.isFallback).toBe(true);
    expect(response.agentType).toBe('crowd_intelligence');
  });

  it('fallbackNavigation satisfies the schema and references the least-crowded open gate', () => {
    const context = baseContext();
    const response = fallbackNavigation(context);
    expect(aiAgentResponseSchema.safeParse(response).success).toBe(true);

    const openGateQueues = context.queueMetrics.filter((q) =>
      context.gates.some((g) => g.id === q.gateId && g.status === 'open'),
    );
    const expectedShortest = openGateQueues.reduce((a, b) => (a.queueLength < b.queueLength ? a : b));
    expect(response.summary).toContain(
      context.gates.find((g) => g.id === expectedShortest.gateId)?.label,
    );
  });

  it('fallbackOperationalReport produces handover-specific sections for reportType "handover"', () => {
    const response = fallbackOperationalReport(baseContext(), 'handover');
    expect(aiAgentResponseSchema.safeParse(response).success).toBe(true);
    const payload = response.payload as { sections: { heading: string }[] };
    const headings = payload.sections.map((s) => s.heading.toLowerCase());
    expect(headings).toEqual(
      expect.arrayContaining(['pending tasks', 'volunteer status', 'next shift priorities']),
    );
  });

  it('fallbackOperationalReport produces post-match-specific sections for reportType "post_match"', () => {
    const response = fallbackOperationalReport(baseContext(), 'post_match');
    const payload = response.payload as { sections: { heading: string }[] };
    const headings = payload.sections.map((s) => s.heading.toLowerCase());
    expect(headings).toEqual(
      expect.arrayContaining(['attendance summary', 'peak congestion', 'lessons learned']),
    );
  });

  it('fallbackEmergencyResponse builds a type-appropriate action plan for a medical incident', () => {
    const context = baseContext();
    const medicalIncident: Incident = {
      id: 'inc-test',
      type: 'medical',
      sectionId: context.sections[0].id,
      severity: 'high',
      status: 'reported',
      description: 'Test medical incident',
      reportedBy: 'system',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    const response = fallbackEmergencyResponse(context, medicalIncident);
    expect(aiAgentResponseSchema.safeParse(response).success).toBe(true);
    const payload = response.payload as { actionPlan: string[]; incidentId: string };
    expect(payload.incidentId).toBe('inc-test');
    expect(payload.actionPlan.join(' ').toLowerCase()).toContain('medical');
  });

  it('fallbackEmergencyResponse includes evacuation guidance for critical severity only', () => {
    const context = baseContext();
    const critical: Incident = {
      id: 'inc-critical',
      type: 'crowd_surge',
      sectionId: context.sections[0].id,
      severity: 'critical',
      status: 'reported',
      description: 'Critical crowd surge',
      reportedBy: 'system',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    const low: Incident = { ...critical, id: 'inc-low', severity: 'low' };

    const criticalResponse = fallbackEmergencyResponse(context, critical);
    const lowResponse = fallbackEmergencyResponse(context, low);

    expect((criticalResponse.payload as { evacuationGuidance: string | null }).evacuationGuidance).not.toBeNull();
    expect((lowResponse.payload as { evacuationGuidance: string | null }).evacuationGuidance).toBeNull();
  });

  it('fallbackVolunteerCoordination satisfies the schema', () => {
    const response = fallbackVolunteerCoordination(baseContext());
    expect(aiAgentResponseSchema.safeParse(response).success).toBe(true);
  });

  it('fallbackFanAssistant escalates instead of answering when the query signals distress', () => {
    const context = baseContext();
    const response = fallbackFanAssistant(context, 'I am hurt and need help', 'en');
    expect(aiAgentResponseSchema.safeParse(response).success).toBe(true);
    expect((response.payload as { escalation: boolean }).escalation).toBe(true);
    expect(response.riskTier).toBe('high');
  });

  it('fallbackFanAssistant answers directly for ordinary venue questions', () => {
    const response = fallbackFanAssistant(baseContext(), 'Where is the nearest restroom?', 'en');
    expect((response.payload as { escalation: boolean }).escalation).toBe(false);
  });

  it('every fallback response id is unique across repeated calls', () => {
    const context = baseContext();
    const ids = new Set([
      fallbackCrowdIntelligence(context).id,
      fallbackCrowdIntelligence(context).id,
      fallbackNavigation(context).id,
    ]);
    expect(ids.size).toBe(3);
  });
});
