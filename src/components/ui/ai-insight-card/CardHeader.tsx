import { Sparkles } from 'lucide-react';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { formatRelativeTime } from '@/utils/formatters';
import { AGENT_LABELS } from '@/components/ui/ai-insight-card/agentLabels';
import type { AIAgentResponse } from '@/types/ai';

/** Agent identity + timestamp + risk badge — the fixed header every card shares. */
export function InsightCardHeader({ response }: { response: AIAgentResponse }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal-soft text-signal">
          <Sparkles size={14} aria-hidden="true" />
        </span>
        <div>
          <div className="text-xs font-medium text-text-secondary">
            {AGENT_LABELS[response.agentType]}
          </div>
          <div className="text-[11px] text-text-tertiary">
            {formatRelativeTime(response.createdAt)}
            {response.isFallback && ' · fallback reasoning'}
          </div>
        </div>
      </div>
      <RiskBadge tier={response.riskTier} />
    </div>
  );
}
