import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSimulationStore } from '@/store/simulationStore';
import { formatRelativeTime } from '@/utils/formatters';
import { Activity, AlertTriangle, ClipboardList, Radar, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const KIND_CONFIG = {
  detection: { icon: Radar, color: 'text-signal' },
  metric: { icon: Activity, color: 'text-text-secondary' },
  risk: { icon: AlertTriangle, color: 'text-risk-medium' },
  ai_recommendation: { icon: Sparkles, color: 'text-signal' },
  volunteer_task: { icon: ClipboardList, color: 'text-risk-low' },
  resolution: { icon: CheckCircle2, color: 'text-risk-low' },
} as const;

/** Live operational timeline — updates automatically as the simulation clock ticks. */
export function AITimeline() {
  const timeline = useSimulationStore((s) => s.timeline);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI operational timeline</CardTitle>
      </CardHeader>

      {timeline.length === 0 && (
        <EmptyState
          icon={<Radar size={24} aria-hidden="true" />}
          title="No timeline yet"
          description="Trigger a scenario to watch the timeline build in real time."
        />
      )}

      {timeline.length > 0 && (
        <ol className="space-y-3 border-l border-border pl-4">
          {[...timeline].reverse().map((entry) => {
            const { icon: Icon, color } = KIND_CONFIG[entry.kind];
            return (
              <li key={entry.id} className="relative">
                <span className={cn('absolute -left-[21px] top-0.5', color)}>
                  <Icon size={14} aria-hidden="true" />
                </span>
                <div className="text-[11px] text-text-tertiary">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {formatRelativeTime(entry.timestamp)}
                </div>
                <p className="text-sm text-text-primary">{entry.label}</p>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
