import { Check, ClipboardCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTasks } from '@/api/tasks.api';
import { useVolunteerTaskStore } from '@/store/volunteerTaskStore';
import { useSimulationStore } from '@/store/simulationStore';
import { cn } from '@/utils/cn';

const PRIORITY_TONE = { low: 'low', medium: 'medium', high: 'high', urgent: 'critical' } as const;
const PRIORITY_WEIGHT = { urgent: 3, high: 2, medium: 1, low: 0 } as const;

/**
 * Live AI task list (implementation §6): prioritized by urgency, with
 * completion actions and ETA. Refreshes automatically as the simulation
 * clock generates new Volunteer Coordination Agent assignments.
 */
export function TaskList() {
  const { data: tasks, isLoading } = useTasks('vol-user-1');
  const completedTaskIds = useVolunteerTaskStore((s) => s.completedTaskIds);
  const completeTask = useVolunteerTaskStore((s) => s.completeTask);
  const pushTimelineEntry = useSimulationStore((s) => s.pushTimelineEntry);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const sorted = [...(tasks ?? [])].sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);

  function handleComplete(taskId: string, title: string) {
    completeTask(taskId);
    pushTimelineEntry({
      timestamp: new Date().toISOString(),
      label: `Volunteer task completed: ${title}`,
      kind: 'volunteer_task',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your tasks</CardTitle>
        <Badge tone="signal">Prioritized by urgency</Badge>
      </CardHeader>

      {sorted.length === 0 && (
        <EmptyState
          icon={<ClipboardCheck size={24} aria-hidden="true" />}
          title="No tasks assigned"
          description="New assignments from the Volunteer Coordination Agent will appear here."
        />
      )}

      {sorted.length > 0 && (
        <ul className="space-y-2.5">
          {sorted.map((task) => {
            const isDone = completedTaskIds.has(task.id);
            return (
              <li
                key={task.id}
                className={cn(
                  'rounded-lg border border-border bg-surface-overlay px-3.5 py-3 transition-opacity',
                  isDone && 'opacity-50',
                )}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className={cn('text-sm font-medium text-text-primary', isDone && 'line-through')}>
                    {task.title}
                  </span>
                  <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                </div>
                <p className="mb-2 text-sm text-text-secondary">{task.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">ETA {task.etaMinutes} min</span>
                  {!isDone && (
                    <Button size="sm" variant="secondary" onClick={() => handleComplete(task.id, task.title)}>
                      <Check size={13} aria-hidden="true" />
                      Mark complete
                    </Button>
                  )}
                  {isDone && <span className="text-xs font-medium text-risk-low">Completed</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
