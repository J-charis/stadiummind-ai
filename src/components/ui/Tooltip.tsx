import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={id}>{children}</span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-strong bg-surface-overlay px-2.5 py-1.5 text-xs text-text-primary shadow-lg transition-opacity duration-150',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
    </span>
  );
}
