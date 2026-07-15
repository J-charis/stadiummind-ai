import type { AIAgentResponse } from '@/types/ai';

export const AGENT_LABELS: Record<AIAgentResponse['agentType'], string> = {
  crowd_intelligence: 'Crowd Intelligence Agent',
  navigation: 'Navigation Agent',
  emergency_response: 'Emergency Response Agent',
  volunteer_coordination: 'Volunteer Coordination Agent',
  fan_assistant: 'Fan Assistant Agent',
  operational_report: 'Operational Report Agent',
  simulation_analysis: 'Simulation Analysis Agent',
};
