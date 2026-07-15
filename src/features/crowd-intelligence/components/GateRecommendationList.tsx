import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGates, useQueueMetrics } from '@/api/zones.api';

export function GateRecommendationList() {
  const { data: gates, isLoading: gLoading } = useGates();
  const { data: queues, isLoading: qLoading } = useQueueMetrics();

  if (gLoading || qLoading || !gates || !queues) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gate status</CardTitle>
      </CardHeader>
      <ul className="space-y-2">
        {gates.map((gate) => {
          const queue = queues.find((q) => q.gateId === gate.id);
          return (
            <li
              key={gate.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-overlay px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm text-text-primary">{gate.code}</span>
                <Badge tone={gate.status === 'open' ? 'low' : 'neutral'}>{gate.status}</Badge>
              </div>
              {queue && (
                <span className="text-xs text-text-secondary">
                  {queue.queueLength} in queue · {Math.round(queue.avgWaitSeconds / 60)} min wait
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
