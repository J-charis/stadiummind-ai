import { useMemo } from 'react';
import { buildOperationalContext, type OperationalContext } from '@/services/ai/operationalContextBuilder';
import { useCrowdMetrics, useQueueMetrics } from '@/api/zones.api';
import { useIncidents } from '@/api/incidents.api';
import { useTasks } from '@/api/tasks.api';
import { useSimulationSnapshot } from '@/api/simulationSnapshot.api';
import { useSimulationStore } from '@/store/simulationStore';

/**
 * Single shared assembly point for OperationalContext, reused by the AI
 * recommendations hook, the report generators, and the Emergency Response
 * trigger — guarantees every consumer reasons over the identical snapshot
 * (Addendum §2).
 */
export function useCurrentOperationalContext(): OperationalContext | null {
  const snapshot = useSimulationSnapshot();
  const { data: crowdMetrics } = useCrowdMetrics();
  const { data: queueMetrics } = useQueueMetrics();
  const { data: incidents } = useIncidents();
  const { data: tasks } = useTasks();
  const timeline = useSimulationStore((s) => s.timeline);

  return useMemo(() => {
    if (!crowdMetrics || !queueMetrics || !incidents || !tasks) return null;

    return buildOperationalContext({
      crowdMetrics,
      queueMetrics,
      incidents,
      tasks,
      simulation: {
        id: snapshot?.simulationId ?? null,
        scenario: snapshot?.scenario ?? null,
        status: snapshot ? (snapshot.intensity > 0 ? 'running' : 'resolved') : 'idle',
        elapsedMinutes: snapshot?.elapsedMinutes ?? 0,
        intensity: snapshot?.intensity ?? 0,
        riskTier: snapshot?.riskTier ?? 'low',
      },
      recentTimeline: timeline.map((t) => ({ label: t.label, timestamp: t.timestamp })),
    });
  }, [crowdMetrics, queueMetrics, incidents, tasks, snapshot, timeline]);
}
