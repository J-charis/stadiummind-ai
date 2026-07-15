import { Activity, Gauge, TriangleAlert, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCrowdMetrics, useSections } from '@/api/zones.api';
import { useIncidents } from '@/api/incidents.api';
import { formatPercent } from '@/utils/formatters';

export function OperationalOverview() {
  const { data: metrics, isLoading: metricsLoading } = useCrowdMetrics();
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: incidents, isLoading: incidentsLoading } = useIncidents();

  const isLoading = metricsLoading || sectionsLoading || incidentsLoading;

  if (isLoading || !metrics || !sections || !incidents) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const avgOccupancy = metrics.reduce((sum, m) => sum + m.occupancy, 0) / metrics.length;
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved').length;
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0);
  const highestSection = metrics.reduce((a, b) => (a.occupancy > b.occupancy ? a : b));
  const highestLabel = sections.find((s) => s.id === highestSection.sectionId)?.label ?? '—';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Average occupancy"
        value={formatPercent(avgOccupancy)}
        icon={<Gauge size={16} aria-hidden="true" />}
        trend={{ direction: avgOccupancy > 0.6 ? 'up' : 'flat', label: 'across all sections' }}
      />
      <StatCard
        label="Active incidents"
        value={String(activeIncidents)}
        icon={<TriangleAlert size={16} aria-hidden="true" />}
        trend={{ direction: activeIncidents > 1 ? 'up' : 'flat', label: 'requiring attention' }}
      />
      <StatCard
        label="Total capacity"
        value={totalCapacity.toLocaleString()}
        icon={<Users size={16} aria-hidden="true" />}
        trend={{ direction: 'flat', label: 'across all sections' }}
      />
      <StatCard
        label="Highest density"
        value={highestLabel}
        icon={<Activity size={16} aria-hidden="true" />}
        trend={{
          direction: highestSection.occupancy > 0.7 ? 'up' : 'flat',
          label: formatPercent(highestSection.occupancy),
        }}
      />
    </div>
  );
}
