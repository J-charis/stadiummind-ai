// Core domain types — mirrors the Postgres schema defined in Engineering Blueprint §7.
// No `any` types anywhere in this file or its consumers.

export type UserRole = 'ops_manager' | 'security' | 'medical' | 'volunteer' | 'fan';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type SectionType = 'stand' | 'concourse' | 'vip' | 'medical_bay' | 'security_post';

export interface StadiumSection {
  id: string;
  code: string;
  label: string;
  capacity: number;
  polygonSvgId: string;
  sectionType: SectionType;
}

export type GateStatus = 'open' | 'closed' | 'restricted';

export interface Gate {
  id: string;
  code: string;
  label: string;
  sectionId: string;
  status: GateStatus;
  capacityPerMin: number;
}

export interface CrowdMetric {
  id: string;
  sectionId: string;
  occupancy: number; // 0-1 fraction of capacity
  flowRate: number; // people/min
  walkingSpeed: number; // m/s
  recordedAt: string;
}

export interface QueueMetric {
  id: string;
  gateId: string;
  queueLength: number;
  avgWaitSeconds: number;
  recordedAt: string;
}

export type IncidentType =
  | 'medical'
  | 'fire'
  | 'gate_closure'
  | 'weather'
  | 'lost_child'
  | 'power_outage'
  | 'security'
  | 'crowd_surge';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'acknowledged' | 'in_progress' | 'resolved';

export interface Incident {
  id: string;
  type: IncidentType;
  sectionId: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  reportedBy: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface AlertItem {
  id: string;
  incidentId: string;
  message: string;
  audienceRole: UserRole | 'all';
  createdAt: string;
}

export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  assigneeId: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  sectionId: string;
  etaMinutes: number;
  createdAt: string;
}

export type RouteType = 'fastest' | 'shortest' | 'accessible' | 'least_crowded';

export interface NavigationRoute {
  id: string;
  originSectionId: string;
  destinationSectionId: string;
  routeType: RouteType;
  estimatedMinutes: number;
  pathSectionIds: string[];
}

export type SimulationScenario =
  | 'heavy_rain'
  | 'gate_closure'
  | 'metro_delay'
  | 'crowd_surge'
  | 'vip_arrival'
  | 'medical_emergency'
  | 'power_outage'
  | 'security_incident';

export type SimulationStatus = 'idle' | 'running' | 'resolved';

export interface SimulationRun {
  id: string;
  scenarioType: SimulationScenario;
  status: SimulationStatus;
  triggeredBy: string;
  startedAt: string;
  endedAt: string | null;
  parameters: Record<string, string | number | boolean>;
}

export interface SimulationEvent {
  id: string;
  simulationId: string;
  eventType: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}

export type RiskTier = 'low' | 'medium' | 'high' | 'critical';

export interface OperationalImpact {
  metric: string;
  projectedChange: string;
  etaMinutes: number;
}

export interface RecommendedAction {
  id: string;
  label: string;
  description: string;
}
