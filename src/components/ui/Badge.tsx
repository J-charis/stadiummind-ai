import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type BadgeTone = 'neutral' | 'signal' | 'low' | 'medium' | 'high' | 'critical';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-overlay text-text-secondary border-border-strong',
  signal: 'bg-signal-soft text-signal border-signal-dim',
  low: 'bg-risk-low-soft text-risk-low border-risk-low/30',
  medium: 'bg-risk-medium-soft text-risk-medium border-risk-medium/30',
  high: 'bg-risk-high-soft text-risk-high border-risk-high/30',
  critical: 'bg-risk-critical-soft text-risk-critical border-risk-critical/30',
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
