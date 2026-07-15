import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { AIAgentResponse } from '@/types/ai';

interface InsightCardDetailsProps {
  response: AIAgentResponse;
  expanded: boolean;
}

/**
 * The height-animated detail section: alternative actions, potential risks,
 * expected outcome. Stays mounted (not conditionally rendered) so Framer
 * Motion can animate its height smoothly — this is intentional, not dead code.
 */
export function InsightCardDetails({ response, expanded }: InsightCardDetailsProps) {
  return (
    <motion.div
      initial={false}
      animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn('overflow-hidden', expanded && 'mt-3')}
    >
      <div className="space-y-3 border-t border-border pt-3 text-sm">
        {response.alternativeActions.length > 0 && (
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Alternative actions
            </div>
            <ul className="space-y-1">
              {response.alternativeActions.map((action) => (
                <li key={action.id} className="text-text-secondary">
                  <span className="font-medium text-text-primary">{action.label}</span>
                  {' — '}
                  {action.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        {response.potentialRisks.length > 0 && (
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Potential risks
            </div>
            <ul className="list-inside list-disc text-text-secondary">
              {response.potentialRisks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Expected outcome
          </div>
          <p className="text-text-secondary">{response.expectedOutcome}</p>
        </div>
      </div>
    </motion.div>
  );
}
