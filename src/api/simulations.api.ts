import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useSimulationStore } from '@/store/simulationStore';
import type { SimulationScenario } from '@/types/domain';

function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/**
 * Triggers a simulation scenario. In production this calls the `simulation-tick`
 * Edge Function (Blueprint §11) which perturbs crowd/queue metrics deterministically
 * and, past risk thresholds, invokes the ai-orchestrator automatically.
 */
export function useStartSimulation() {
  const queryClient = useQueryClient();
  const startSimulation = useSimulationStore((s) => s.startSimulation);

  return useMutation({
    mutationFn: async (scenario: SimulationScenario) => {
      const id = `sim-${Date.now()}`;
      await mockDelay({ id, scenario });
      return { id, scenario };
    },
    onSuccess: ({ id, scenario }) => {
      startSimulation(id, scenario);
      queryClient.invalidateQueries({ queryKey: queryKeys.crowdMetrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    },
  });
}
