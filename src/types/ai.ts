// AI reasoning contract types — GenAI Architecture Addendum v1.1 §3 and §5.
// Every agent response conforms to this shape. Nothing renders without it.

export type AgentType =
  | 'crowd_intelligence'
  | 'navigation'
  | 'emergency_response'
  | 'volunteer_coordination'
  | 'fan_assistant'
  | 'operational_report'
  | 'simulation_analysis';

import type { OperationalImpact, RecommendedAction, RiskTier } from '@/types/domain';

export interface AIAgentResponse<TPayload = Record<string, unknown>> {
  id: string;
  agentType: AgentType;
  summary: string;
  reasoning: string;
  confidenceScore: number; // 0–1
  operationalImpact: OperationalImpact;
  alternativeActions: RecommendedAction[];
  potentialRisks: string[];
  expectedOutcome: string;
  riskTier: RiskTier;
  createdAt: string;
  payload: TPayload;
  /** True when this response was produced by the deterministic fallback path, not Gemini. */
  isFallback: boolean;
}

export interface CrowdIntelligencePayload {
  sectionId: string;
  congestionForecast: 'improving' | 'stable' | 'worsening';
}

export interface NavigationPayload {
  routeId: string;
  avoidedSectionIds: string[];
}

export interface EmergencyResponsePayload {
  incidentId: string;
  actionPlan: string[];
  evacuationGuidance: string | null;
}

export interface VolunteerCoordinationPayload {
  taskId: string;
  guidanceNotes: string;
}

export interface FanAssistantPayload {
  locale: string;
  escalation: boolean;
}

export interface OperationalReportPayload {
  reportType: 'situation' | 'briefing' | 'handover' | 'post_match';
  sections: { heading: string; body: string }[];
}

export interface SimulationAnalysisPayload {
  simulationId: string;
  keyMoments: string[];
  overallAssessment: string;
}

export interface AIConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
