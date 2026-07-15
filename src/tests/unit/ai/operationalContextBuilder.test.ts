import { describe, it, expect } from 'vitest';
import { buildOperationalContext } from '@/services/ai/operationalContextBuilder';
import { mockCrowdMetrics, mockQueueMetrics, mockIncidents, mockTasks } from '@/services/mock/operations.mock';
import type { Incident } from '@/types/domain';

const baseInput = {
  crowdMetrics: mockCrowdMetrics,
  queueMetrics: mockQueueMetrics,
  incidents: mockIncidents,
  tasks: mockTasks,
  simulation: {
    id: null,
    scenario: null,
    status: 'idle' as const,
    elapsedMinutes: 0,
    intensity: 0,
    riskTier: 'low' as const,
  },
  recentTimeline: [],
};

describe('buildOperationalContext', () => {
  it('derives overall risk as the higher of active-incident severity and simulation risk', () => {
    const highIncident: Incident = {
      id: 'inc-high',
      type: 'crowd_surge',
      sectionId: 'sec-a',
      severity: 'high',
      status: 'in_progress',
      description: 'test',
      reportedBy: 'system',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    const context = buildOperationalContext({
      ...baseInput,
      incidents: [highIncident],
      simulation: { ...baseInput.simulation, riskTier: 'medium' },
    });

    expect(context.overallRiskTier).toBe('high');
  });

  it('ignores resolved incidents when deriving overall risk', () => {
    const resolvedCritical: Incident = {
      id: 'inc-resolved',
      type: 'medical',
      sectionId: 'sec-a',
      severity: 'critical',
      status: 'resolved',
      description: 'test',
      reportedBy: 'system',
      createdAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
    };

    const context = buildOperationalContext({
      ...baseInput,
      incidents: [resolvedCritical],
      simulation: { ...baseInput.simulation, riskTier: 'low' },
    });

    expect(context.overallRiskTier).toBe('low');
  });

  it('falls back to simulation risk when there are no active incidents at all', () => {
    const context = buildOperationalContext({
      ...baseInput,
      incidents: [],
      simulation: { ...baseInput.simulation, riskTier: 'critical' },
    });
    expect(context.overallRiskTier).toBe('critical');
  });

  it('reflects rain weather only when the active simulation scenario is heavy_rain', () => {
    const rainContext = buildOperationalContext({
      ...baseInput,
      simulation: { ...baseInput.simulation, scenario: 'heavy_rain', intensity: 0.6 },
    });
    const clearContext = buildOperationalContext({
      ...baseInput,
      simulation: { ...baseInput.simulation, scenario: 'metro_delay', intensity: 0.6 },
    });

    expect(rainContext.weather.condition).toBe('rain');
    expect(rainContext.weather.intensity).toBe(0.6);
    expect(clearContext.weather.condition).toBe('clear');
  });

  it('reduces available volunteer count while a simulation is running', () => {
    const idleContext = buildOperationalContext(baseInput);
    const runningContext = buildOperationalContext({
      ...baseInput,
      simulation: { ...baseInput.simulation, status: 'running' },
    });

    expect(runningContext.volunteerAvailability.available).toBeLessThan(
      idleContext.volunteerAvailability.available,
    );
  });

  it('passes through the sections and gates every agent needs for grounding', () => {
    const context = buildOperationalContext(baseInput);
    expect(context.sections.length).toBeGreaterThan(0);
    expect(context.gates.length).toBeGreaterThan(0);
  });
});
