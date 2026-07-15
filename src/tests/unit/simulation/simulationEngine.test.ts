import { describe, it, expect } from 'vitest';
import { computeSimulationSnapshot } from '@/services/simulation/simulationEngine';
import { SCENARIO_DEFINITIONS } from '@/services/simulation/scenarioDefinitions';
import { mockGates, mockSections } from '@/services/mock/stadium.mock';

const START_TIME = new Date('2026-07-14T18:00:00.000Z').getTime();

describe('computeSimulationSnapshot', () => {
  it('is deterministic: identical (scenario, minute) always yields identical metrics', () => {
    const a = computeSimulationSnapshot('sim-1', 'metro_delay', 5, START_TIME);
    const b = computeSimulationSnapshot('sim-1', 'metro_delay', 5, START_TIME);
    expect(a.crowdMetrics).toEqual(b.crowdMetrics);
    expect(a.queueMetrics).toEqual(b.queueMetrics);
    expect(a.intensity).toBe(b.intensity);
  });

  it('produces one crowd metric per non-medical section and one queue metric per gate', () => {
    const snapshot = computeSimulationSnapshot('sim-1', 'metro_delay', 5, START_TIME);
    const nonMedicalSections = mockSections.filter((s) => s.sectionType !== 'medical_bay');
    expect(snapshot.crowdMetrics).toHaveLength(nonMedicalSections.length);
    expect(snapshot.queueMetrics).toHaveLength(mockGates.length);
  });

  it('keeps every occupancy value within the valid [0, 1] range', () => {
    const def = SCENARIO_DEFINITIONS.crowd_surge;
    for (let minute = 0; minute <= def.resolvesAtMinute; minute += 1) {
      const snapshot = computeSimulationSnapshot('sim-1', 'crowd_surge', minute, START_TIME);
      for (const metric of snapshot.crowdMetrics) {
        expect(metric.occupancy).toBeGreaterThanOrEqual(0);
        expect(metric.occupancy).toBeLessThanOrEqual(1);
      }
    }
  });

  it('raises occupancy more sharply in a scenario\'s primary section than in unaffected sections', () => {
    const def = SCENARIO_DEFINITIONS.metro_delay;
    const baseline = computeSimulationSnapshot('sim-1', 'metro_delay', 0, START_TIME);
    const peak = computeSimulationSnapshot('sim-1', 'metro_delay', def.peakAtMinute, START_TIME);

    const primarySectionId = def.primarySectionIds[0];
    const unaffectedSectionId = mockSections.find((s) => !def.primarySectionIds.includes(s.id))!.id;

    const primaryDelta =
      peak.crowdMetrics.find((m) => m.sectionId === primarySectionId)!.occupancy -
      baseline.crowdMetrics.find((m) => m.sectionId === primarySectionId)!.occupancy;
    const unaffectedDelta =
      peak.crowdMetrics.find((m) => m.sectionId === unaffectedSectionId)!.occupancy -
      baseline.crowdMetrics.find((m) => m.sectionId === unaffectedSectionId)!.occupancy;

    expect(primaryDelta).toBeGreaterThan(unaffectedDelta);
  });

  describe('incident lifecycle (regression: incidents must not disappear on resolution)', () => {
    it('reports no incident before the scenario has meaningfully started', () => {
      const snapshot = computeSimulationSnapshot('sim-1', 'metro_delay', 0, START_TIME);
      expect(snapshot.incidents).toHaveLength(0);
    });

    it('reports an active incident while the scenario is escalating', () => {
      const def = SCENARIO_DEFINITIONS.metro_delay;
      const snapshot = computeSimulationSnapshot('sim-1', 'metro_delay', def.peakAtMinute, START_TIME);
      expect(snapshot.incidents).toHaveLength(1);
      expect(snapshot.incidents[0].status).not.toBe('resolved');
    });

    it('keeps the incident visible and marks it resolved once the scenario decays to baseline, instead of removing it', () => {
      const def = SCENARIO_DEFINITIONS.metro_delay;
      const snapshot = computeSimulationSnapshot('sim-1', 'metro_delay', def.resolvesAtMinute, START_TIME);

      // Regression guard: earlier logic dropped the incident from the array
      // entirely once intensity decayed past a threshold, so it silently
      // vanished from the feed instead of showing as resolved.
      expect(snapshot.incidents).toHaveLength(1);
      expect(snapshot.incidents[0].status).toBe('resolved');
      expect(snapshot.incidents[0].resolvedAt).not.toBeNull();
    });

    it('preserves the same incident id across ticks so the UI treats it as one continuous incident', () => {
      const def = SCENARIO_DEFINITIONS.metro_delay;
      const early = computeSimulationSnapshot('sim-1', 'metro_delay', 2, START_TIME);
      const late = computeSimulationSnapshot('sim-1', 'metro_delay', def.resolvesAtMinute, START_TIME);
      expect(early.incidents[0].id).toBe(late.incidents[0].id);
    });
  });

  describe('volunteer task generation', () => {
    it('generates a task once intensity crosses the task-generation threshold', () => {
      const def = SCENARIO_DEFINITIONS.crowd_surge;
      const low = computeSimulationSnapshot('sim-1', 'crowd_surge', 1, START_TIME);
      const peak = computeSimulationSnapshot('sim-1', 'crowd_surge', def.peakAtMinute, START_TIME);
      expect(low.tasks.length + peak.tasks.length).toBeGreaterThan(0);
      expect(peak.tasks[0].priority).toMatch(/urgent|high/);
    });
  });

  it('derives risk tier consistently with the intensity at that minute', () => {
    const def = SCENARIO_DEFINITIONS.crowd_surge;
    const snapshot = computeSimulationSnapshot('sim-1', 'crowd_surge', def.peakAtMinute, START_TIME);
    expect(snapshot.riskTier).toBe('critical');
  });
});
