import type {
  AlertItem,
  CrowdMetric,
  Incident,
  QueueMetric,
  SimulationScenario,
  SimulationStatus,
  Task,
} from '@/types/domain';
import { mockGates, mockSections } from '@/services/mock/stadium.mock';
import { mockAlerts as baselineAlerts } from '@/services/mock/operations.mock';

// Operational Context Builder — GenAI Architecture Addendum §2 / §7.
// Assembles exactly one snapshot per orchestrator invocation so every agent
// reasons over identical facts. Nothing downstream re-derives this data itself.

export interface OperationalContext {
  generatedAt: string;
  sections: typeof mockSections;
  gates: typeof mockGates;
  crowdMetrics: CrowdMetric[];
  queueMetrics: QueueMetric[];
  incidents: Incident[];
  alerts: AlertItem[];
  tasks: Task[];
  volunteerAvailability: { total: number; available: number };
  weather: { condition: 'clear' | 'rain' | 'storm'; intensity: number };
  simulation: {
    id: string | null;
    scenario: SimulationScenario | null;
    status: SimulationStatus;
    elapsedMinutes: number;
    intensity: number;
    riskTier: 'low' | 'medium' | 'high' | 'critical';
  };
  recentTimeline: { label: string; timestamp: string }[];
  overallRiskTier: 'low' | 'medium' | 'high' | 'critical';
}

export interface BuildContextInput {
  crowdMetrics: CrowdMetric[];
  queueMetrics: QueueMetric[];
  incidents: Incident[];
  tasks: Task[];
  simulation: {
    id: string | null;
    scenario: SimulationScenario | null;
    status: SimulationStatus;
    elapsedMinutes: number;
    intensity: number;
    riskTier: 'low' | 'medium' | 'high' | 'critical';
  };
  recentTimeline: { label: string; timestamp: string }[];
}

const RISK_ORDER: Record<'low' | 'medium' | 'high' | 'critical', number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

function deriveOverallRisk(
  incidents: Incident[],
  simulationRisk: 'low' | 'medium' | 'high' | 'critical',
): 'low' | 'medium' | 'high' | 'critical' {
  const activeIncidentRisk = incidents
    .filter((i) => i.status !== 'resolved')
    .reduce<'low' | 'medium' | 'high' | 'critical'>((max, i) => {
      return RISK_ORDER[i.severity] > RISK_ORDER[max] ? i.severity : max;
    }, 'low');

  return RISK_ORDER[simulationRisk] > RISK_ORDER[activeIncidentRisk]
    ? simulationRisk
    : activeIncidentRisk;
}

/**
 * Builds the single OperationalContext object every AI agent receives.
 * Pure function of its inputs — the orchestrator calls this exactly once
 * per reasoning pass (Addendum §2).
 */
export function buildOperationalContext(input: BuildContextInput): OperationalContext {
  const overallRiskTier = deriveOverallRisk(input.incidents, input.simulation.riskTier);

  return {
    generatedAt: new Date().toISOString(),
    sections: mockSections,
    gates: mockGates,
    crowdMetrics: input.crowdMetrics,
    queueMetrics: input.queueMetrics,
    incidents: input.incidents,
    alerts: baselineAlerts,
    tasks: input.tasks,
    volunteerAvailability: { total: 12, available: input.simulation.status === 'running' ? 8 : 11 },
    weather: {
      condition: input.simulation.scenario === 'heavy_rain' ? 'rain' : 'clear',
      intensity: input.simulation.scenario === 'heavy_rain' ? input.simulation.intensity : 0,
    },
    simulation: input.simulation,
    recentTimeline: input.recentTimeline,
    overallRiskTier,
  };
}
