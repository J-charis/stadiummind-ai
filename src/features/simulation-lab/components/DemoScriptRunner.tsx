import { Play, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ReportGeneratorButton } from '@/features/reports';
import { useDemoScript } from '@/features/simulation-lab/hooks/useDemoScript';

const STAGE_LABELS: Record<string, string> = {
  idle: 'Not started',
  running_metro_delay: 'Metro delay running — crowd growing, AI reasoning live',
  ready_for_handover: 'Scenario resolved — ready to generate shift handover',
  ready_for_post_match: 'Ready to generate post-match report',
  complete: 'Demo complete',
};

/**
 * One-click scripted demonstration (implementation §11): Metro Delay →
 * Crowd Growth → AI Recommendation → Volunteer Task → Gate Opens →
 * Congestion Reduces → Shift Handover → Post-Match Report. The middle
 * stages happen automatically via the simulation engine + AI orchestrator
 * already wired into every module; this panel sequences the explicit
 * demo checkpoints and exposes the two report generators at the right time.
 */
export function DemoScriptRunner() {
  const { stage, run, advanceToPostMatch, complete, reset } = useDemoScript();

  return (
    <Card className="border-signal-dim/50">
      <CardHeader>
        <CardTitle>Scripted demo</CardTitle>
        <Badge tone={stage === 'complete' ? 'low' : stage === 'idle' ? 'neutral' : 'signal'}>
          {STAGE_LABELS[stage]}
        </Badge>
      </CardHeader>

      <p className="mb-4 text-sm text-text-secondary">
        Runs the full narrative: metro delay detected → crowd growth → AI recommendation → volunteer
        task → gate opens → congestion reduces → shift handover → post-match report. Watch Command
        Center, Digital Twin, and Volunteer Copilot update automatically while this runs.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {stage === 'idle' && (
          <Button size="sm" onClick={run}>
            <Play size={14} aria-hidden="true" />
            Run demo
          </Button>
        )}

        {stage === 'running_metro_delay' && (
          <span className="text-xs text-text-tertiary">Scenario in progress…</span>
        )}

        {stage === 'ready_for_handover' && (
          <>
            <ReportGeneratorButton reportType="handover" />
            <Button size="sm" variant="secondary" onClick={advanceToPostMatch}>
              Continue to post-match report
            </Button>
          </>
        )}

        {stage === 'ready_for_post_match' && (
          <>
            <ReportGeneratorButton reportType="post_match" />
            <Button size="sm" onClick={complete}>
              <CheckCircle2 size={14} aria-hidden="true" />
              Mark demo complete
            </Button>
          </>
        )}

        {stage === 'complete' && (
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw size={14} aria-hidden="true" />
            Reset demo
          </Button>
        )}
      </div>
    </Card>
  );
}
