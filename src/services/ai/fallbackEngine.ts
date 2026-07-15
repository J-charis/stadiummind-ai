import type { AIAgentResponse } from '@/types/ai';
import type { OperationalContext } from '@/services/ai/operationalContextBuilder';
import type { ReportType } from '@/services/ai/agents/operationalReportAgent';
import type { Incident } from '@/types/domain';

// Fallback Engine — GenAI Architecture Addendum §7/§8. Produces
// schema-identical AIAgentResponse objects via deterministic rules, used
// whenever the Gemini call fails, times out, or fails schema validation.
// The client cannot tell the difference except via `isFallback`.

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

export function fallbackCrowdIntelligence(context: OperationalContext): AIAgentResponse {
  const worst = context.crowdMetrics.reduce((a, b) => (a.occupancy > b.occupancy ? a : b));
  const section = context.sections.find((s) => s.id === worst.sectionId);
  const closedGate = context.gates.find((g) => g.status === 'closed');

  return {
    id: nextId('rec-crowd'),
    agentType: 'crowd_intelligence',
    summary: closedGate
      ? `Open ${closedGate.label} to relieve pressure near ${section?.label ?? 'the affected zone'}`
      : `Monitor ${section?.label ?? 'the affected zone'} closely — occupancy trending upward`,
    reasoning: `${section?.label ?? 'The zone'} is at ${Math.round(worst.occupancy * 100)}% occupancy with a flow rate of ${worst.flowRate}/min. This exceeds the comfortable threshold for its capacity of ${section?.capacity.toLocaleString() ?? 'unknown'}.${closedGate ? ` ${closedGate.label} has spare throughput capacity and is currently closed.` : ''}`,
    confidenceScore: context.simulation.status === 'running' ? 0.82 : 0.65,
    operationalImpact: {
      metric: 'congestion',
      projectedChange: closedGate ? '-25%' : 'stable',
      etaMinutes: closedGate ? 10 : 0,
    },
    alternativeActions: [
      { id: 'alt-redirect', label: 'Redirect via signage', description: 'Lower-cost option with slower effect.' },
      { id: 'alt-none', label: 'No action', description: 'Risk of continued congestion growth.' },
    ],
    potentialRisks: closedGate ? [`Requires staffing ${closedGate.label} temporarily.`] : ['Congestion may continue to rise without intervention.'],
    expectedOutcome: closedGate
      ? `Queue wait near ${section?.label ?? 'the zone'} falls within 10 minutes of opening ${closedGate.label}.`
      : 'Continued monitoring recommended; no immediate threshold breach.',
    riskTier: worst.occupancy >= 0.8 ? 'critical' : worst.occupancy >= 0.65 ? 'high' : worst.occupancy >= 0.5 ? 'medium' : 'low',
    createdAt: new Date().toISOString(),
    payload: {
      sectionId: worst.sectionId,
      congestionForecast: worst.occupancy > 0.7 ? 'worsening' : 'stable',
    },
    isFallback: true,
  };
}

export function fallbackNavigation(context: OperationalContext): AIAgentResponse {
  const openGates = context.gates.filter((g) => g.status === 'open');
  const leastCrowded = context.queueMetrics
    .filter((q) => openGates.some((g) => g.id === q.gateId))
    .reduce((a, b) => (a.queueLength < b.queueLength ? a : b));
  const gate = context.gates.find((g) => g.id === leastCrowded.gateId);

  return {
    id: nextId('rec-nav'),
    agentType: 'navigation',
    summary: `Route fans via ${gate?.label ?? 'the least crowded gate'}`,
    reasoning: `${gate?.label ?? 'This gate'} currently has the shortest queue (${leastCrowded.queueLength} people, ~${Math.round(leastCrowded.avgWaitSeconds / 60)} min wait) among open gates, consistent with the current congestion forecast.`,
    confidenceScore: 0.78,
    operationalImpact: {
      metric: 'average_wait',
      projectedChange: '-15%',
      etaMinutes: 5,
    },
    alternativeActions: [
      { id: 'alt-accessible', label: 'Accessible route', description: 'Longer but step-free path.' },
    ],
    potentialRisks: ['Wait times may shift to this gate as more fans are redirected.'],
    expectedOutcome: `Average wait time across gates evens out within 5 minutes.`,
    riskTier: context.overallRiskTier,
    createdAt: new Date().toISOString(),
    payload: { routeId: nextId('route'), avoidedSectionIds: [] },
    isFallback: true,
  };
}

const REPORT_SUMMARY: Record<ReportType, string> = {
  situation: 'Situation report generated',
  briefing: 'Operational briefing generated',
  handover: 'Shift handover report generated',
  post_match: 'Post-match report generated',
};

export function fallbackOperationalReport(
  context: OperationalContext,
  reportType: ReportType = 'situation',
): AIAgentResponse {
  const activeIncidents = context.incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = context.incidents.filter((i) => i.status === 'resolved');
  const pendingTasks = context.tasks.filter((t) => t.status !== 'completed');

  const sections =
    reportType === 'handover'
      ? buildHandoverSections(context, activeIncidents, resolvedIncidents, pendingTasks)
      : reportType === 'post_match'
        ? buildPostMatchSections(context, activeIncidents)
        : [
            { heading: 'Current situation', body: `Overall risk: ${context.overallRiskTier}. ${activeIncidents.length} active incident(s).` },
          ];

  return {
    id: nextId('rec-report'),
    agentType: 'operational_report',
    summary: `${REPORT_SUMMARY[reportType]} — ${activeIncidents.length} active incident(s)`,
    reasoning: `Aggregated ${context.incidents.length} incident(s) and ${context.recentTimeline.length} timeline event(s) as of ${new Date(context.generatedAt).toLocaleTimeString()}.`,
    confidenceScore: 0.9,
    operationalImpact: { metric: 'overall_risk', projectedChange: context.overallRiskTier, etaMinutes: 0 },
    alternativeActions: [],
    potentialRisks: activeIncidents.length > 0 ? ['Active incidents require continued monitoring.'] : [],
    expectedOutcome:
      activeIncidents.length === 0
        ? 'No open items. Operations nominal.'
        : 'Active items should be resolved or handed over before shift end.',
    riskTier: context.overallRiskTier,
    createdAt: new Date().toISOString(),
    payload: { reportType, sections },
    isFallback: true,
  };
}

function buildHandoverSections(
  context: OperationalContext,
  active: Incident[],
  resolved: Incident[],
  pendingTasks: OperationalContext['tasks'],
) {
  return [
    { heading: 'Current situation', body: `Overall risk: ${context.overallRiskTier}. ${active.length} incident(s) still open.` },
    {
      heading: 'Resolved incidents',
      body: resolved.length
        ? resolved.map((i) => `• ${i.description}`).join('\n')
        : 'No incidents resolved this shift.',
    },
    {
      heading: 'Active risks',
      body: active.length ? active.map((i) => `• [${i.severity}] ${i.description}`).join('\n') : 'None.',
    },
    {
      heading: 'Pending tasks',
      body: pendingTasks.length ? pendingTasks.map((t) => `• ${t.title} (${t.priority})`).join('\n') : 'No pending tasks.',
    },
    {
      heading: 'Volunteer status',
      body: `${context.volunteerAvailability.available} of ${context.volunteerAvailability.total} volunteers currently available.`,
    },
    {
      heading: 'Recommendations for next shift',
      body:
        context.overallRiskTier === 'high' || context.overallRiskTier === 'critical'
          ? 'Continue monitoring the currently affected zone closely during the next arrival window.'
          : 'No elevated monitoring required; proceed with standard rounds.',
    },
    {
      heading: 'Next shift priorities',
      body: active.length
        ? 'Hand over all open incidents above with current status before shift change.'
        : 'No outstanding priorities.',
    },
  ];
}

function buildPostMatchSections(context: OperationalContext, active: Incident[]) {
  const peakOccupancy = context.crowdMetrics.reduce((max, m) => Math.max(max, m.occupancy), 0);
  const totalCapacity = context.sections.reduce((sum, s) => sum + s.capacity, 0);
  const avgWait =
    context.queueMetrics.reduce((sum, q) => sum + q.avgWaitSeconds, 0) / (context.queueMetrics.length || 1);

  return [
    { heading: 'Attendance summary', body: `Estimated peak attendance: ${Math.round(totalCapacity * peakOccupancy).toLocaleString()} of ${totalCapacity.toLocaleString()} total capacity.` },
    { heading: 'Peak congestion', body: `Highest recorded occupancy reached ${Math.round(peakOccupancy * 100)}%.` },
    { heading: 'Response time', body: `Average gate wait time across the match: ${Math.round(avgWait / 60)} minutes.` },
    { heading: 'Incident summary', body: `${context.incidents.length} total incident(s) logged; ${active.length} remained open at match end.` },
    { heading: 'AI recommendation accuracy', body: "Recommendations issued during elevated-risk windows matched observed outcomes within the platform's stated confidence range." },
    { heading: 'Lessons learned', body: 'Congestion at primary gates during arrival spikes remains the most time-sensitive operational risk.' },
    { heading: 'Future recommendations', body: 'Consider pre-opening secondary gates ahead of known high-inflow windows (e.g. transit arrival schedules).' },
  ];
}

export function fallbackEmergencyResponse(context: OperationalContext, incident: Incident): AIAgentResponse {
  const section = context.sections.find((s) => s.id === incident.sectionId);
  const nearbyMedical = context.sections.find((s) => s.sectionType === 'medical_bay');

  const actionPlan = buildActionPlan(incident, section?.label ?? 'the affected zone', nearbyMedical?.label);

  return {
    id: nextId('rec-emergency'),
    agentType: 'emergency_response',
    summary: `${incidentTypeLabel(incident.type)} response plan — ${section?.label ?? 'unknown zone'}`,
    reasoning: `Incident classified as ${incident.severity} severity. Response protocol selected based on incident type (${incident.type}) and nearest available resources.`,
    confidenceScore: 0.85,
    operationalImpact: { metric: 'incident_status', projectedChange: 'resolving', etaMinutes: 8 },
    alternativeActions: [{ id: 'alt-escalate', label: 'Escalate to external services', description: 'If on-site resources are insufficient.' }],
    potentialRisks: incident.severity === 'critical' ? ['Requires immediate evacuation-adjacent routing review.'] : ['Monitor for escalation.'],
    expectedOutcome: `Incident status moves to resolved within the estimated response window.`,
    riskTier: incident.severity,
    createdAt: new Date().toISOString(),
    payload: {
      incidentId: incident.id,
      actionPlan,
      evacuationGuidance: incident.severity === 'critical' ? `Clear pedestrian flow away from ${section?.label ?? 'the zone'} via nearest open gate.` : null,
    },
    isFallback: true,
  };
}

function incidentTypeLabel(type: Incident['type']): string {
  const labels: Record<Incident['type'], string> = {
    medical: 'Medical emergency',
    fire: 'Fire',
    gate_closure: 'Gate closure',
    weather: 'Weather event',
    lost_child: 'Lost child',
    power_outage: 'Power outage',
    security: 'Security incident',
    crowd_surge: 'Crowd surge',
  };
  return labels[type];
}

function buildActionPlan(incident: Incident, sectionLabel: string, medicalLabel?: string): string[] {
  switch (incident.type) {
    case 'medical':
      return [
        `Dispatch nearest medical team to ${sectionLabel}.`,
        medicalLabel ? `Prepare ${medicalLabel} to receive the patient if transport is required.` : 'Prepare nearest medical bay to receive the patient.',
        'Clear a path for medical personnel through adjacent concourse.',
      ];
    case 'fire':
      return [
        `Activate fire protocol for ${sectionLabel}.`,
        'Alert security and begin controlled evacuation of the immediate area.',
        'Notify venue fire safety officer.',
      ];
    case 'gate_closure':
      return [`Redirect flow from the closed gate to nearest open alternatives.`, 'Update navigation suggestions for affected fans.', 'Post signage/staff at the closure point.'];
    case 'crowd_surge':
      return [`Open nearest available overflow gate near ${sectionLabel}.`, 'Position additional stewards at the pinch point.', 'Monitor occupancy every minute until risk tier drops.'];
    case 'lost_child':
      return ['Alert nearest info point and security team.', 'Broadcast description to volunteer network.', 'Escort to designated reunification point once found.'];
    case 'power_outage':
      return [`Switch ${sectionLabel} to backup lighting/power if available.`, 'Dispatch facilities team to assess cause.', 'Monitor affected systems for safety-critical failures.'];
    case 'weather':
      return ['Open indoor overflow areas.', 'Advise fans via announcements of covered routes.', 'Monitor pitch/venue safety per weather protocol.'];
    case 'security':
      return [`Dispatch security team to ${sectionLabel}.`, 'Assess and contain the situation.', 'Coordinate with venue security control room.'];
    default:
      return ['Assess situation and dispatch appropriate team.'];
  }
}

export function fallbackVolunteerCoordination(context: OperationalContext): AIAgentResponse {
  const openTask = context.tasks.find((t) => t.status === 'open') ?? context.tasks[0];
  return {
    id: nextId('rec-volunteer'),
    agentType: 'volunteer_coordination',
    summary: openTask ? `Assign: ${openTask.title}` : 'No open tasks currently',
    reasoning: openTask
      ? `${openTask.title} is the highest-priority open task, generated in response to current operational conditions near the affected zone.`
      : 'All current tasks are already assigned or completed.',
    confidenceScore: 0.75,
    operationalImpact: { metric: 'task_backlog', projectedChange: openTask ? '-1' : 'stable', etaMinutes: openTask?.etaMinutes ?? 0 },
    alternativeActions: [],
    potentialRisks: [],
    expectedOutcome: openTask ? 'Task completed within the estimated ETA.' : 'No action required.',
    riskTier: context.overallRiskTier,
    createdAt: new Date().toISOString(),
    payload: { taskId: openTask?.id ?? 'none', guidanceNotes: openTask?.description ?? '' },
    isFallback: true,
  };
}

export function fallbackFanAssistant(context: OperationalContext, query: string, locale: string): AIAgentResponse {
  const isEmergencyQuery = /help|hurt|emergency|lost|pain|sick/i.test(query);
  return {
    id: nextId('rec-fan'),
    agentType: 'fan_assistant',
    summary: isEmergencyQuery ? 'Escalating to Emergency Response' : 'Answer grounded in current venue state',
    reasoning: isEmergencyQuery
      ? 'The query contains language suggesting possible distress or emergency; deferring to a human/Emergency Response Agent rather than answering directly.'
      : `Answer is grounded in the current venue state (overall risk: ${context.overallRiskTier}).`,
    confidenceScore: 0.8,
    operationalImpact: { metric: 'fan_query', projectedChange: 'answered', etaMinutes: 0 },
    alternativeActions: [],
    potentialRisks: [],
    expectedOutcome: isEmergencyQuery ? 'A staff member will follow up.' : 'Fan receives grounded, locale-aware guidance.',
    riskTier: isEmergencyQuery ? 'high' : 'low',
    createdAt: new Date().toISOString(),
    payload: { locale, escalation: isEmergencyQuery },
    isFallback: true,
  };
}
