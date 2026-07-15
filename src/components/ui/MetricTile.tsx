import { cn } from '@/utils/cn';

interface MetricTileProps {
  label: string;
  value: string;
  tone?: 'default' | 'warning' | 'danger';
}

export function MetricTile({ label, value, tone = 'default' }: MetricTileProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-overlay px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wide text-text-tertiary">{label}</div>
      <div
        className={cn(
          'font-mono text-lg font-semibold',
          tone === 'default' && 'text-text-primary',
          tone === 'warning' && 'text-risk-medium',
          tone === 'danger' && 'text-risk-high',
        )}
      >
        {value}
      </div>
    </div>
  );
}
