import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
      {icon && <div className="text-text-tertiary">{icon}</div>}
      <div className="font-display text-sm font-semibold text-text-primary">{title}</div>
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      {action}
    </div>
  );
}
