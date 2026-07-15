import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useIncidents } from '@/api/incidents.api';
import { useAIRecommendations } from '@/api/aiRecommendations.api';
import { formatRelativeTime } from '@/utils/formatters';
import { Sparkles, TriangleAlert } from 'lucide-react';

/** Chronological merge of incidents and AI recommendations — the operational story so far. */
export function DecisionTimeline() {
  const { data: incidents } = useIncidents();
  const { data: recommendations } = useAIRecommendations();

  const events = [
    ...(incidents ?? []).map((i) => ({
      id: i.id,
      type: 'incident' as const,
      label: i.description,
      timestamp: i.createdAt,
    })),
    ...(recommendations ?? []).map((r) => ({
      id: r.id,
      type: 'ai' as const,
      label: r.summary,
      timestamp: r.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision timeline</CardTitle>
      </CardHeader>
      <ol className="space-y-4 border-l border-border pl-4">
        {events.map((event) => (
          <li key={event.id} className="relative">
            <span
              className={`absolute -left-[21px] top-1 flex h-3 w-3 items-center justify-center rounded-full ${
                event.type === 'ai' ? 'bg-signal' : 'bg-risk-medium'
              }`}
            />
            <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
              {event.type === 'ai' ? (
                <Sparkles size={11} aria-hidden="true" />
              ) : (
                <TriangleAlert size={11} aria-hidden="true" />
              )}
              {formatRelativeTime(event.timestamp)}
            </div>
            <p className="mt-0.5 text-sm text-text-primary">{event.label}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
