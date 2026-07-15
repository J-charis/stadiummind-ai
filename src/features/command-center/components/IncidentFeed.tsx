import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useIncidents } from '@/api/incidents.api';
import { useEmergencyResponse } from '@/api/emergencyResponse.api';
import { formatRelativeTime } from '@/utils/formatters';
import { CheckCircle2, Inbox, ShieldAlert, Loader2 } from 'lucide-react';
import type { Incident } from '@/types/domain';

const SEVERITY_TONE = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
} as const;

const STATUS_LABEL: Record<string, string> = {
  reported: 'Reported',
  acknowledged: 'Acknowledged',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

export function IncidentFeed() {
  const { data: incidents, isLoading } = useIncidents();
  const { mutate: generatePlan, isPending, data: plan, variables: planIncident } = useEmergencyResponse();
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);

  function handleGeneratePlan(incident: Incident) {
    setExpandedIncidentId(incident.id);
    generatePlan(incident);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident feed</CardTitle>
        <Badge tone="signal">{incidents?.filter((i) => i.status !== 'resolved').length ?? 0} active</Badge>
      </CardHeader>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {!isLoading && incidents?.length === 0 && (
        <EmptyState
          icon={<Inbox size={24} aria-hidden="true" />}
          title="No incidents reported"
          description="The stadium is operating normally. New incidents will appear here as they're reported."
        />
      )}

      {!isLoading && incidents && incidents.length > 0 && (
        <ul className="space-y-2.5">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="rounded-lg border border-border bg-surface-overlay px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge tone={SEVERITY_TONE[incident.severity]}>{incident.severity}</Badge>
                    <span className="text-xs text-text-tertiary">
                      {STATUS_LABEL[incident.status]}
                    </span>
                    {incident.status === 'resolved' && (
                      <CheckCircle2 size={13} className="text-risk-low" aria-hidden="true" />
                    )}
                  </div>
                  <p className="truncate text-sm text-text-primary">{incident.description}</p>
                </div>
                <span className="shrink-0 text-xs text-text-tertiary">
                  {formatRelativeTime(incident.createdAt)}
                </span>
              </div>

              {incident.status !== 'resolved' && (
                <div className="mt-2.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGeneratePlan(incident)}
                    disabled={isPending && planIncident?.id === incident.id}
                  >
                    {isPending && planIncident?.id === incident.id ? (
                      <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <ShieldAlert size={13} aria-hidden="true" />
                    )}
                    Generate response plan
                  </Button>
                </div>
              )}

              {expandedIncidentId === incident.id && plan && planIncident?.id === incident.id && (
                <div className="mt-3">
                  <AIInsightCard response={plan} interactive />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
