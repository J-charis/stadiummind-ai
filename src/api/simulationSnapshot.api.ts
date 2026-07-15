import { useMemo } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { computeSimulationSnapshot } from '@/services/simulation/simulationEngine';
import type { SimulationSnapshot } from '@/services/simulation/simulationEngine';

/**
 * Central read model: derives the current operational snapshot from
 * simulation state when a scenario is active/resolved, otherwise returns
 * baseline mock data. Every feature-level query hook reads through this so
 * Command Center, Digital Twin, Crowd Intelligence, and Volunteer Copilot
 * update in lockstep off one source of truth (Blueprint §9 dashboard
 * integration requirement).
 */
export function useSimulationSnapshot(): SimulationSnapshot | null {
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);
  const activeScenario = useSimulationStore((s) => s.activeScenario);
  const status = useSimulationStore((s) => s.status);
  const elapsedSimMinutes = useSimulationStore((s) => s.elapsedSimMinutes);
  const startTimeMs = useSimulationStore((s) => s.startTimeMs);

  return useMemo(() => {
    if (!activeSimulationId || !activeScenario || !startTimeMs || status === 'idle') return null;
    return computeSimulationSnapshot(activeSimulationId, activeScenario, elapsedSimMinutes, startTimeMs);
  }, [activeSimulationId, activeScenario, status, elapsedSimMinutes, startTimeMs]);
}
