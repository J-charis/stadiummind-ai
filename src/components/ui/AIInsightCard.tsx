import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { ConfidenceIndicator } from '@/components/ui/ConfidenceIndicator';
import { Badge } from '@/components/ui/Badge';
import { InsightCardHeader } from '@/components/ui/ai-insight-card/CardHeader';
import { InsightCardActions } from '@/components/ui/ai-insight-card/CardActions';
import { InsightCardDetails } from '@/components/ui/ai-insight-card/CardDetails';
import { useRecommendationDecision } from '@/components/ui/ai-insight-card/useRecommendationDecision';
import type { AIAgentResponse } from '@/types/ai';

interface AIInsightCardProps {
  response: AIAgentResponse;
  /** Show Approve/Reject/Timeline-link actions. Off by default for read-only contexts. */
  interactive?: boolean;
}

/**
 * Renders the platform's explainability contract (GenAI Addendum §5) identically
 * everywhere an AI recommendation appears: summary, reasoning, confidence,
 * operational impact, alternatives, risks, expected outcome — plus, when
 * `interactive`, the human-approval actions required by implementation
 * milestone §11 (Approve / Reject / View Details / Timeline Link).
 *
 * Composed from ai-insight-card/* subcomponents (header, actions, expandable
 * details) plus the useRecommendationDecision hook, keeping each piece small
 * and independently testable while this file stays a thin orchestrator.
 */
export function AIInsightCard({ response, interactive = false }: AIInsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { isApproved, isRejected, handleApprove, handleReject } = useRecommendationDecision(response);

  return (
    <Card className="border-signal-dim/40 bg-gradient-to-b from-surface-raised to-surface-raised">
      <InsightCardHeader response={response} />

      <h4 className="mb-1.5 font-display text-sm font-semibold text-text-primary">
        {response.summary}
      </h4>
      <p className="mb-3 text-sm leading-relaxed text-text-secondary">{response.reasoning}</p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <ConfidenceIndicator score={response.confidenceScore} />
        <Badge tone="signal">
          {response.operationalImpact.metric}: {response.operationalImpact.projectedChange}
          {response.operationalImpact.etaMinutes > 0 &&
            ` · ${response.operationalImpact.etaMinutes} min`}
        </Badge>
        {isApproved && <Badge tone="low">Approved</Badge>}
        {isRejected && <Badge tone="neutral">Dismissed</Badge>}
      </div>

      {interactive && !isApproved && !isRejected && (
        <InsightCardActions onApprove={handleApprove} onReject={handleReject} />
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex items-center gap-1 text-xs font-medium text-signal hover:underline"
        >
          {expanded ? 'Hide reasoning detail' : 'View details'}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>
        {interactive && (
          <a
            href="/simulation-lab"
            className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary"
          >
            View in timeline
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
      </div>

      <InsightCardDetails response={response} expanded={expanded} />
    </Card>
  );
}
