import type {
  CrowdMetric,
  Incident,
  QueueMetric,
  SimulationEvent,
  SimulationScenario,
  Task,
} from '@/types/domain';
import { mockGates, mockSections } from '@/services/mock/stadium.mock';
import {
  SCENARIO_DEFINITIONS,
  intensityAtMinute,
  riskTierFromIntensity,
} from '@/services/simulation/scenarioDefinitions';

// Deterministic simulation engine. Given a scenario + elapsed minutes, produces
// the full set of derived operational data. Same (scenario, minute) pair always
// yields the same output — required for reproducible demo/replay behavior.

const BASELINE_OCCUPANCY: Record<string, number> = {
  'sec-a': 0.55,
  'sec-b': 0.35,
  'sec-c': 0.4,
  'sec-d': 0.25,
  'sec-vip': 0.3,
  'sec-med': 0.05,
};

const BASELINE_QUEUE: Record<string, { length: number; waitSeconds: number }> = {
  'gate-3': { length: 20, waitSeconds: 120 },
  'gate-4': { length: 22, waitSeconds: 130 },
  'gate-5': { length: 12, waitSeconds: 80 },
  'gate-6': { length: 8, waitSeconds: 60 },
  'gate-7': { length: 15, waitSeconds: 90 },
  'gate-8': { length: 10, waitSeconds: 70 },
};

export interface SimulationSnapshot {
  simulationId: string;
  scenario: SimulationScenario;
  elapsedMinutes: number;
  intensity: number;
  riskTier: 'low' | 'medium' | 'high' | 'critical';
  crowdMetrics: CrowdMetric[];
  queueMetrics: QueueMetric[];
  incidents: Incident[];
  tasks: Task[];
  events: SimulationEvent[];
}

function isoAtMinuteOffset(startTimeMs: number, minute: number): string {
  return new Date(startTimeMs + minute * 60_000).toISOString();
}

/**
 * Computes the full operational snapshot at a given elapsed-minute for an
 * active simulation. Deterministic: no randomness, only the triangular
 * intensity ramp defined per scenario.
 */
export function computeSimulationSnapshot(
  simulationId: string,
  scenario: SimulationScenario,
  elapsedMinutes: number,
  startTimeMs: number,
): SimulationSnapshot {
  const def = SCENARIO_DEFINITIONS[scenario];
  const intensity = intensityAtMinute(def, elapsedMinutes);
  const riskTier = riskTierFromIntensity(intensity);
  const recordedAt = isoAtMinuteOffset(startTimeMs, elapsedMinutes);

  const crowdMetrics: CrowdMetric[] = mockSections
    .filter((s) => s.sectionType !== 'medical_bay')
    .map((section, i) => {
      const baseline = BASELINE_OCCUPANCY[section.id] ?? 0.3;
      const affected = def.primarySectionIds.includes(section.id);
      const occupancy = Math.min(0.98, baseline + (affected ? intensity * 0.42 : intensity * 0.05));
      return {
        id: `cm-${section.id}-${elapsedMinutes}`,
        sectionId: section.id,
        occupancy,
        flowRate: Math.round(60 + occupancy * 220 + i),
        walkingSpeed: Number((1.4 - occupancy * 0.9).toFixed(2)),
        recordedAt,
      };
    });

  const queueMetrics: QueueMetric[] = mockGates.map((gate) => {
    const baseline = BASELINE_QUEUE[gate.id] ?? { length: 10, waitSeconds: 60 };
    const affected = def.primaryGateIds.includes(gate.id);
    const multiplier = affected ? 1 + intensity * 3.5 : 1 + intensity * 0.3;
    return {
      id: `qm-${gate.id}-${elapsedMinutes}`,
      gateId: gate.id,
      queueLength: Math.round(baseline.length * multiplier),
      avgWaitSeconds: Math.round(baseline.waitSeconds * multiplier),
      recordedAt,
    };
  });

  const incidents: Incident[] = [];
  if (intensity > 0.02 || elapsedMinutes >= def.resolvesAtMinute) {
    const affectedSectionId = def.primarySectionIds[0] ?? mockSections[0].id;
    const isResolved = intensity <= 0.02;
    incidents.push({
      id: `${simulationId}-incident`,
      type: def.incidentType,
      sectionId: affectedSectionId,
      severity: isResolved ? riskTierFromIntensity(def.peakIntensity) as Incident['severity'] : (riskTierFromIntensity(intensity) as Incident['severity']),
      status: isResolved ? 'resolved' : intensity >= def.peakIntensity * 0.9 ? 'acknowledged' : 'in_progress',
      description: scenarioIncidentDescription(scenario, isResolved ? 'resolved' : riskTier),
      reportedBy: 'system',
      createdAt: isoAtMinuteOffset(startTimeMs, 0),
      resolvedAt: isResolved ? recordedAt : null,
    });
  }

  const tasks: Task[] = [];
  if (intensity > 0.35) {
    tasks.push({
      id: `${simulationId}-task-1`,
      assigneeId: 'vol-user-1',
      title: scenarioTaskTitle(scenario),
      description: scenarioTaskDescription(scenario, def),
      priority: intensity >= 0.7 ? 'urgent' : 'high',
      status: 'assigned',
      sectionId: def.primarySectionIds[0] ?? mockSections[0].id,
      etaMinutes: 5,
      createdAt: recordedAt,
    });
  }

  const events: SimulationEvent[] = [
    {
      id: `${simulationId}-event-${elapsedMinutes}`,
      simulationId,
      eventType: intensity === 0 ? 'resolved' : 'tick',
      payload: { intensity, riskTier },
      occurredAt: recordedAt,
    },
  ];

  return { simulationId, scenario, elapsedMinutes, intensity, riskTier, crowdMetrics, queueMetrics, incidents, tasks, events };
}

function scenarioIncidentDescription(scenario: SimulationScenario, riskTier: string): string {
  const labels: Record<SimulationScenario, string> = {
    metro_delay: 'Metro delay causing rapid inflow near Gate 4',
    heavy_rain: 'Heavy rain reducing outdoor flow, indoor demand rising',
    gate_closure: 'Gate 6 closed, load redistributing to adjacent gates',
    medical_emergency: 'Medical incident reported in Section C',
    crowd_surge: 'Rapid occupancy surge detected in Section A',
    vip_arrival: 'VIP arrival route temporarily restricted',
    power_outage: 'Power outage affecting West Concourse systems',
    security_incident: 'Security incident reported in Section C',
  };
  return `${labels[scenario]} (risk: ${riskTier}).`;
}

function scenarioTaskTitle(scenario: SimulationScenario): string {
  const titles: Record<SimulationScenario, string> = {
    metro_delay: 'Direct fans toward Gate 5/6',
    heavy_rain: 'Open indoor queuing lanes',
    gate_closure: 'Redirect flow away from Gate 6',
    medical_emergency: 'Support medical team access to Section C',
    crowd_surge: 'Assist crowd redistribution in Section A',
    vip_arrival: 'Escort VIP party along cleared route',
    power_outage: 'Guide fans away from affected West Concourse area',
    security_incident: 'Support security team in Section C',
  };
  return titles[scenario];
}

function scenarioTaskDescription(scenario: SimulationScenario, def: (typeof SCENARIO_DEFINITIONS)[SimulationScenario]): string {
  const sectionLabel = mockSections.find((s) => s.id === def.primarySectionIds[0])?.label ?? 'the affected area';
  return `Generated by the Volunteer Coordination Agent in response to the active ${scenario.replace('_', ' ')} scenario near ${sectionLabel}.`;
}
