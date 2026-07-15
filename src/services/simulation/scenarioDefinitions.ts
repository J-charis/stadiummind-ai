import type { SimulationScenario } from '@/types/domain';

// Deterministic simulation engine — GenAI Architecture Addendum §6 / Blueprint §11.
// No Math.random() anywhere: every tick is a pure function of elapsed simulated
// minutes and the scenario's fixed parameter model, so replays are reproducible.

export interface ScenarioDefinition {
  id: SimulationScenario;
  label: string;
  /** Section(s) primarily affected by this scenario. */
  primarySectionIds: string[];
  /** Gate(s) most affected by this scenario. */
  primaryGateIds: string[];
  /** Peak intensity reached at `peakAtMinute`, then decays back to baseline. */
  peakIntensity: number;
  peakAtMinute: number;
  /** Total minutes until the scenario fully resolves back to baseline. */
  resolvesAtMinute: number;
  incidentType: 'crowd_surge' | 'weather' | 'gate_closure' | 'medical' | 'power_outage';
  incidentSeverityAtPeak: 'low' | 'medium' | 'high' | 'critical';
}

export const SCENARIO_DEFINITIONS: Record<SimulationScenario, ScenarioDefinition> = {
  metro_delay: {
    id: 'metro_delay',
    label: 'Metro Delay',
    primarySectionIds: ['sec-a'],
    primaryGateIds: ['gate-3', 'gate-4'],
    peakIntensity: 0.95,
    peakAtMinute: 6,
    resolvesAtMinute: 18,
    incidentType: 'crowd_surge',
    incidentSeverityAtPeak: 'high',
  },
  heavy_rain: {
    id: 'heavy_rain',
    label: 'Heavy Rain',
    primarySectionIds: ['sec-b', 'sec-d'],
    primaryGateIds: ['gate-5', 'gate-8'],
    peakIntensity: 0.75,
    peakAtMinute: 8,
    resolvesAtMinute: 25,
    incidentType: 'weather',
    incidentSeverityAtPeak: 'medium',
  },
  gate_closure: {
    id: 'gate_closure',
    label: 'Gate Closure',
    primarySectionIds: ['sec-b'],
    primaryGateIds: ['gate-6'],
    peakIntensity: 0.7,
    peakAtMinute: 4,
    resolvesAtMinute: 20,
    incidentType: 'gate_closure',
    incidentSeverityAtPeak: 'medium',
  },
  medical_emergency: {
    id: 'medical_emergency',
    label: 'Medical Emergency',
    primarySectionIds: ['sec-c'],
    primaryGateIds: ['gate-7'],
    peakIntensity: 0.4,
    peakAtMinute: 2,
    resolvesAtMinute: 15,
    incidentType: 'medical',
    incidentSeverityAtPeak: 'high',
  },
  crowd_surge: {
    id: 'crowd_surge',
    label: 'Crowd Surge',
    primarySectionIds: ['sec-a'],
    primaryGateIds: ['gate-3', 'gate-4'],
    peakIntensity: 1,
    peakAtMinute: 3,
    resolvesAtMinute: 14,
    incidentType: 'crowd_surge',
    incidentSeverityAtPeak: 'critical',
  },
  vip_arrival: {
    id: 'vip_arrival',
    label: 'VIP Arrival',
    primarySectionIds: ['sec-vip'],
    primaryGateIds: [],
    peakIntensity: 0.5,
    peakAtMinute: 3,
    resolvesAtMinute: 10,
    incidentType: 'gate_closure',
    incidentSeverityAtPeak: 'low',
  },
  power_outage: {
    id: 'power_outage',
    label: 'Power Outage',
    primarySectionIds: ['sec-d'],
    primaryGateIds: ['gate-8'],
    peakIntensity: 0.65,
    peakAtMinute: 5,
    resolvesAtMinute: 22,
    incidentType: 'power_outage',
    incidentSeverityAtPeak: 'high',
  },
  security_incident: {
    id: 'security_incident',
    label: 'Security Incident',
    primarySectionIds: ['sec-c'],
    primaryGateIds: ['gate-7'],
    peakIntensity: 0.6,
    peakAtMinute: 3,
    resolvesAtMinute: 16,
    incidentType: 'crowd_surge',
    incidentSeverityAtPeak: 'high',
  },
};

/**
 * Deterministic triangular ramp: rises linearly to peakIntensity at
 * peakAtMinute, then decays linearly to 0 by resolvesAtMinute. Pure function
 * of elapsed minutes — same input always produces the same output.
 */
export function intensityAtMinute(def: ScenarioDefinition, elapsedMinutes: number): number {
  if (elapsedMinutes <= 0) return 0;
  if (elapsedMinutes >= def.resolvesAtMinute) return 0;

  if (elapsedMinutes <= def.peakAtMinute) {
    return (elapsedMinutes / def.peakAtMinute) * def.peakIntensity;
  }

  const decayProgress =
    (elapsedMinutes - def.peakAtMinute) / (def.resolvesAtMinute - def.peakAtMinute);
  return def.peakIntensity * (1 - decayProgress);
}

/** Deterministic risk tier bucketing from a continuous intensity value. */
export function riskTierFromIntensity(intensity: number): 'low' | 'medium' | 'high' | 'critical' {
  if (intensity >= 0.75) return 'critical';
  if (intensity >= 0.5) return 'high';
  if (intensity >= 0.25) return 'medium';
  return 'low';
}
