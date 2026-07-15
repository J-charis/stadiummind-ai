import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { mockGates, mockSections } from '@/services/mock/stadium.mock';
import { mockCrowdMetrics, mockQueueMetrics } from '@/services/mock/operations.mock';
import { useSimulationSnapshot } from '@/api/simulationSnapshot.api';

function mockDelay<T>(data: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function useSections() {
  return useQuery({
    queryKey: queryKeys.sections,
    queryFn: () => mockDelay(mockSections),
    staleTime: Infinity,
  });
}

export function useGates() {
  return useQuery({
    queryKey: queryKeys.gates,
    queryFn: () => mockDelay(mockGates),
    staleTime: Infinity,
  });
}

/**
 * Live crowd metrics — reads through the active simulation snapshot when one
 * is running/resolved, falling back to baseline mock data otherwise. This is
 * what makes Command Center, Digital Twin, and Crowd Intelligence update in
 * lockstep the instant a scenario is triggered (Blueprint §9).
 */
export function useCrowdMetrics() {
  const snapshot = useSimulationSnapshot();
  return useQuery({
    queryKey: [...queryKeys.crowdMetrics, snapshot?.elapsedMinutes ?? 'baseline'],
    queryFn: () => mockDelay(snapshot ? snapshot.crowdMetrics : mockCrowdMetrics),
  });
}

export function useQueueMetrics() {
  const snapshot = useSimulationSnapshot();
  return useQuery({
    queryKey: [...queryKeys.queueMetrics, snapshot?.elapsedMinutes ?? 'baseline'],
    queryFn: () => mockDelay(snapshot ? snapshot.queueMetrics : mockQueueMetrics),
  });
}
