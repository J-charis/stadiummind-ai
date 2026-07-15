import { useSections, useCrowdMetrics } from '@/api/zones.api';
import { useUIStore } from '@/store/uiStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

function occupancyFill(occupancy: number): string {
  if (occupancy >= 0.8) return 'fill-risk-high/60 hover:fill-risk-high/80 stroke-risk-high';
  if (occupancy >= 0.6) return 'fill-risk-medium/50 hover:fill-risk-medium/70 stroke-risk-medium';
  return 'fill-risk-low/40 hover:fill-risk-low/60 stroke-risk-low';
}

export function StadiumSvgCanvas() {
  const { data: sections, isLoading: sLoading } = useSections();
  const { data: metrics, isLoading: mLoading } = useCrowdMetrics();
  const selectedZoneId = useUIStore((s) => s.selectedZoneId);
  const setSelectedZone = useUIStore((s) => s.setSelectedZone);

  if (sLoading || mLoading || !sections || !metrics) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  return (
    <svg
      viewBox="0 0 600 460"
      className="h-[480px] w-full"
      role="img"
      aria-label="Interactive stadium map showing live zone occupancy"
    >
      <ellipse cx="300" cy="230" rx="280" ry="190" className="fill-surface-overlay stroke-border" strokeWidth={1.5} />

      {sections
        .filter((s) => s.sectionType === 'stand' || s.sectionType === 'concourse' || s.sectionType === 'vip')
        .map((section, i, arr) => {
          const metric = metrics.find((m) => m.sectionId === section.id);
          const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
          const cx = 300 + Math.cos(angle) * 195;
          const cy = 230 + Math.sin(angle) * 130;
          const isSelected = selectedZoneId === section.id;

          return (
            <g key={section.id}>
              <motion.circle
                cx={cx}
                cy={cy}
                animate={{
                  r: isSelected ? 34 : 30,
                  scale: (metric?.occupancy ?? 0) >= 0.8 ? [1, 1.06, 1] : 1,
                }}
                transition={{
                  r: { duration: 0.2 },
                  scale: { duration: 1.4, repeat: (metric?.occupancy ?? 0) >= 0.8 ? Infinity : 0 },
                }}
                className={cn(
                  'cursor-pointer transition-[fill,stroke] duration-500',
                  occupancyFill(metric?.occupancy ?? 0),
                  isSelected && 'stroke-signal stroke-[3]',
                )}
                strokeWidth={isSelected ? 3 : 1.5}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${section.label}, ${Math.round((metric?.occupancy ?? 0) * 100)}% occupied`}
                onClick={() => setSelectedZone(isSelected ? null : section.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedZone(isSelected ? null : section.id);
                  }
                }}
              />
              <text x={cx} y={cy + 4} textAnchor="middle" className="pointer-events-none fill-text-primary text-[11px] font-mono font-medium">
                {section.code}
              </text>
              <text x={cx} y={cy + 46} textAnchor="middle" className="pointer-events-none fill-text-tertiary text-[9px]">
                {section.label}
              </text>
            </g>
          );
        })}

      <ellipse cx="300" cy="230" rx="95" ry="62" className="fill-surface-base stroke-border" strokeWidth={1.5} />
      <text x="300" y="234" textAnchor="middle" className="fill-text-tertiary text-[11px] font-mono">
        PITCH
      </text>
    </svg>
  );
}
