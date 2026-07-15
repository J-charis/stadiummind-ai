import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InsightCardActionsProps {
  onApprove: () => void;
  onReject: () => void;
}

/** Approve/Reject actions — only rendered while a recommendation is undecided. */
export function InsightCardActions({ onApprove, onReject }: InsightCardActionsProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={onApprove}>
        <Check size={14} aria-hidden="true" />
        Approve
      </Button>
      <Button size="sm" variant="secondary" onClick={onReject}>
        <X size={14} aria-hidden="true" />
        Reject
      </Button>
    </div>
  );
}
