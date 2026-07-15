import type {
  AlertItem,
  CrowdMetric,
  Incident,
  QueueMetric,
  Task,
} from '@/types/domain';
import type { AIAgentResponse } from '@/types/ai';

const now = () => new Date().toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const mockCrowdMetrics: CrowdMetric[] = [
  { id: 'cm-1', sectionId: 'sec-a', occupancy: 0.82, flowRate: 210, walkingSpeed: 0.7, recordedAt: minutesAgo(1) },
  { id: 'cm-2', sectionId: 'sec-b', occupancy: 0.45, flowRate: 90, walkingSpeed: 1.2, recordedAt: minutesAgo(1) },
  { id: 'cm-3', sectionId: 'sec-c', occupancy: 0.58, flowRate: 120, walkingSpeed: 1.1, recordedAt: minutesAgo(1) },
  { id: 'cm-4', sectionId: 'sec-d', occupancy: 0.31, flowRate: 60, walkingSpeed: 1.3, recordedAt: minutesAgo(1) },
  { id: 'cm-5', sectionId: 'sec-vip', occupancy: 0.4, flowRate: 15, walkingSpeed: 1.4, recordedAt: minutesAgo(1) },
];

export const mockQueueMetrics: QueueMetric[] = [
  { id: 'qm-1', gateId: 'gate-3', queueLength: 64, avgWaitSeconds: 420, recordedAt: minutesAgo(1) },
  { id: 'qm-2', gateId: 'gate-4', queueLength: 88, avgWaitSeconds: 610, recordedAt: minutesAgo(1) },
  { id: 'qm-3', gateId: 'gate-5', queueLength: 22, avgWaitSeconds: 140, recordedAt: minutesAgo(1) },
  { id: 'qm-4', gateId: 'gate-7', queueLength: 30, avgWaitSeconds: 180, recordedAt: minutesAgo(1) },
  { id: 'qm-5', gateId: 'gate-8', queueLength: 12, avgWaitSeconds: 90, recordedAt: minutesAgo(1) },
];

export const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    type: 'medical',
    sectionId: 'sec-c',
    severity: 'medium',
    status: 'in_progress',
    description: 'Fan reported dizziness, Section C row 14. Medical team en route.',
    reportedBy: 'volunteer-22',
    createdAt: minutesAgo(6),
    resolvedAt: null,
  },
  {
    id: 'inc-2',
    type: 'crowd_surge',
    sectionId: 'sec-a',
    severity: 'high',
    status: 'acknowledged',
    description: 'Rapid occupancy increase near Gate 4 following metro arrival.',
    reportedBy: 'system',
    createdAt: minutesAgo(3),
    resolvedAt: null,
  },
  {
    id: 'inc-3',
    type: 'lost_child',
    sectionId: 'sec-b',
    severity: 'low',
    status: 'resolved',
    description: 'Child reunited with guardian near East Concourse info point.',
    reportedBy: 'volunteer-08',
    createdAt: minutesAgo(40),
    resolvedAt: minutesAgo(28),
  },
];

export const mockAlerts: AlertItem[] = [
  { id: 'al-1', incidentId: 'inc-2', message: 'Elevated congestion risk near Gate 4.', audienceRole: 'ops_manager', createdAt: minutesAgo(3) },
  { id: 'al-2', incidentId: 'inc-1', message: 'Medical response active in Section C.', audienceRole: 'medical', createdAt: minutesAgo(6) },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    assigneeId: 'vol-user-1',
    title: 'Direct fans toward Gate 5',
    description: 'Support flow redistribution while Gate 4 congestion resolves.',
    priority: 'high',
    status: 'assigned',
    sectionId: 'sec-a',
    etaMinutes: 5,
    createdAt: minutesAgo(2),
  },
  {
    id: 'task-2',
    assigneeId: 'vol-user-1',
    title: 'Check in with Medical Bay 1',
    description: 'Confirm status of in-progress medical incident in Section C.',
    priority: 'medium',
    status: 'open',
    sectionId: 'sec-med',
    etaMinutes: 10,
    createdAt: minutesAgo(6),
  },
];

export const mockRecommendations: AIAgentResponse[] = [
  {
    id: 'rec-1',
    agentType: 'crowd_intelligence',
    summary: 'Open Gate 6 to relieve Gate 4 congestion',
    reasoning:
      'Crowd density near Gate 4 has increased due to delayed metro arrivals. Current inflow exceeds Gate 4 throughput by 38%. Gate 6 is currently closed but adjacent to the affected concourse with spare capacity.',
    confidenceScore: 0.87,
    operationalImpact: { metric: 'congestion', projectedChange: '-28%', etaMinutes: 10 },
    alternativeActions: [
      { id: 'alt-1', label: 'Redirect to Gate 5', description: 'Lower impact, no staffing change required.' },
      { id: 'alt-2', label: 'No action', description: 'Congestion is projected to persist for 20+ minutes.' },
    ],
    potentialRisks: ['Requires reassigning 1 volunteer to staff Gate 6 temporarily.'],
    expectedOutcome: 'Queue wait at Gate 4 falls below 5 minutes within 10 minutes of opening Gate 6.',
    riskTier: 'high',
    createdAt: minutesAgo(2),
    payload: { sectionId: 'sec-a', congestionForecast: 'worsening' },
    isFallback: false,
  },
  {
    id: 'rec-2',
    agentType: 'operational_report',
    summary: 'Situation report generated for the last 15 minutes',
    reasoning:
      'Aggregated 3 incidents and 1 active recommendation across the last reporting window. Crowd levels in Section A are trending upward; all other sections stable.',
    confidenceScore: 0.94,
    operationalImpact: { metric: 'overall_risk', projectedChange: 'stable', etaMinutes: 0 },
    alternativeActions: [],
    potentialRisks: [],
    expectedOutcome: 'No immediate action required outside of the active Gate 4 recommendation.',
    riskTier: 'medium',
    createdAt: minutesAgo(1),
    payload: { reportType: 'situation', sections: [] },
    isFallback: false,
  },
];

export const seedTimestamp = now();
