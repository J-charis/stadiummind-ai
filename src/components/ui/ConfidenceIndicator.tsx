import { cn } from '@/utils/cn';

/** Renders an AI confidence score as a labeled meter — never a bare percentage. */
export function ConfidenceIndicator({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const level = score >= 0.8 ? 'high' : score >= 0.5 ? 'medium' : 'low';
  const barColor =
    level === 'high' ? 'bg-risk-low' : level === 'medium' ? 'bg-risk-medium' : 'bg-risk-high';

  return (
    <div className="flex items-center gap-2" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-overlay">
        <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-text-secondary">{pct}% confidence</span>
    </div>
  );
}
