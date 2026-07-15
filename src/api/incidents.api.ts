import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { mockAlerts, mockIncidents } from '@/services/mock/operations.mock';
import { useSimulationSnapshot } from '@/api/simulationSnapshot.api';

function mockDelay<T>(data: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/** Incidents merge baseline (resolved/historical) with any active-simulation incident. */
export function useIncidents() {
  const snapshot = useSimulationSnapshot();
  return useQuery({
    queryKey: [...queryKeys.incidents, snapshot?.elapsedMinutes ?? 'baseline'],
    queryFn: () => mockDelay(snapshot ? [...snapshot.incidents, ...mockIncidents] : mockIncidents),
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts,
    queryFn: () => mockDelay(mockAlerts),
  });
}
