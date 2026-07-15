import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { mockTasks } from '@/services/mock/operations.mock';
import { useSimulationSnapshot } from '@/api/simulationSnapshot.api';

function mockDelay<T>(data: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/** Volunteer tasks merge baseline assignments with any AI-generated simulation task. */
export function useTasks(assigneeId?: string) {
  const snapshot = useSimulationSnapshot();
  return useQuery({
    queryKey: [...queryKeys.tasks(assigneeId), snapshot?.elapsedMinutes ?? 'baseline'],
    queryFn: () => {
      const combined = snapshot ? [...snapshot.tasks, ...mockTasks] : mockTasks;
      return mockDelay(assigneeId ? combined.filter((t) => t.assigneeId === assigneeId) : combined);
    },
  });
}
