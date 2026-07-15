import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSections, useCrowdMetrics } from '@/api/zones.api';
import { Skeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

function occupancyColor(occupancy: number): string {
  if (occupancy >= 0.8) return 'fill-risk-high/70 stroke-risk-high';
  if (occupancy >= 0.6) return 'fill-risk-medium/60 stroke-risk-medium';
  return 'fill-risk-low/50 stroke-risk-low';
}

/** Compact preview of the Digital Stadium Twin, linking to the full module. */
export function DigitalTwinPreview() {
  const { data: sections, isLoading: sLoading } = useSections();
  const { data: metrics, isLoading: mLoading } = useCrowdMetrics();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital stadium twin</CardTitle>
        <Link to={ROUTES.digitalTwin} className="text-xs font-medium text-signal hover:underline">
          Open full view
        </Link>
      </CardHeader>

      {(sLoading || mLoading) && <Skeleton className="h-56 w-full" />}

      {!sLoading && !mLoading && sections && metrics && (
        <svg viewBox="0 0 300 220" className="h-56 w-full" role="img" aria-label="Stadium occupancy overview">
          <ellipse cx="150" cy="110" rx="140" ry="95" className="fill-surface-overlay stroke-border" strokeWidth={1} />
          {sections
            .filter((s) => s.sectionType === 'stand' || s.sectionType === 'concourse')
            .map((section, i, arr) => {
              const metric = metrics.find((m) => m.sectionId === section.id);
              const angle = (i / arr.length) * Math.PI * 2;
              const cx = 150 + Math.cos(angle) * 95;
              const cy = 110 + Math.sin(angle) * 65;
              return (
                <g key={section.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={16}
                    className={cn('transition-colors', occupancyColor(metric?.occupancy ?? 0))}
                    strokeWidth={1.5}
                  />
                  <text x={cx} y={cy + 3} textAnchor="middle" className="fill-text-primary text-[9px] font-mono">
                    {section.code}
                  </text>
                </g>
              );
            })}
          <ellipse cx="150" cy="110" rx="46" ry="30" className="fill-surface-base stroke-border" strokeWidth={1} />
          <text x="150" y="113" textAnchor="middle" className="fill-text-tertiary text-[9px] font-mono">
            PITCH
          </text>
        </svg>
      )}
    </Card>
  );
}
