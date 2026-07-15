// Centralized query key registry — enables precise, consistent cache invalidation.
export const queryKeys = {
  sections: ['sections'] as const,
  gates: ['gates'] as const,
  crowdMetrics: ['crowd-metrics'] as const,
  queueMetrics: ['queue-metrics'] as const,
  incidents: ['incidents'] as const,
  alerts: ['alerts'] as const,
  tasks: (assigneeId?: string) => ['tasks', assigneeId] as const,
  recommendations: ['ai-recommendations'] as const,
  simulations: ['simulations'] as const,
};
