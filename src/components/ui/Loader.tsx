import { cn } from '@/utils/cn';

export function Loader({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex items-center gap-2 text-text-secondary', className)}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
      </span>
      <span className="text-xs">{label}</span>
    </div>
  );
}
