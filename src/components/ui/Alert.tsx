import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const CONFIG: Record<AlertTone, { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: 'border-signal-dim bg-signal-soft text-signal' },
  success: { icon: CheckCircle2, classes: 'border-risk-low/30 bg-risk-low-soft text-risk-low' },
  warning: { icon: TriangleAlert, classes: 'border-risk-medium/30 bg-risk-medium-soft text-risk-medium' },
  danger: { icon: AlertCircle, classes: 'border-risk-high/30 bg-risk-high-soft text-risk-high' },
};

export function Alert({ tone = 'info', children }: { tone?: AlertTone; children: ReactNode }) {
  const { icon: Icon, classes } = CONFIG[tone];
  return (
    <div role="alert" className={cn('flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm', classes)}>
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="text-text-primary">{children}</div>
    </div>
  );
}
