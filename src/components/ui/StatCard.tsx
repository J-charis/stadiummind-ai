import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
  icon?: ReactNode;
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-text-secondary">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="font-display font-tabular text-2xl font-semibold text-text-primary">
        {value}
      </div>
      {trend && (
        <span
          className={cn(
            'text-xs font-medium',
            trend.direction === 'up' && 'text-risk-high',
            trend.direction === 'down' && 'text-risk-low',
            trend.direction === 'flat' && 'text-text-tertiary',
          )}
        >
          {trend.label}
        </span>
      )}
    </Card>
  );
}
