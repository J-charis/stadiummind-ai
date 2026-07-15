import { FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { useSituationReport } from '@/api/reports.api';
import { reportToMarkdown, downloadMarkdown } from '@/utils/reportMarkdown';
import { formatRelativeTime } from '@/utils/formatters';
import type { OperationalReportPayload } from '@/types/ai';

/**
 * Auto-refreshing Situation Report panel (implementation §9). Regenerates
 * periodically off live OperationalContext and is exportable as markdown.
 */
export function SituationReportPanel() {
  const { data: report, isLoading } = useSituationReport();

  if (isLoading || !report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Situation report</CardTitle>
        </CardHeader>
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  const payload = report.payload as unknown as OperationalReportPayload;
  const topRisks = payload.sections.find((s) => s.heading.toLowerCase().includes('risk'));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Situation report</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-tertiary">{formatRelativeTime(report.createdAt)}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadMarkdown(`situation-report-${Date.now()}.md`, reportToMarkdown(report))}
            aria-label="Download situation report as markdown"
          >
            <Download size={14} aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>

      <div className="mb-3 flex items-center gap-2">
        <FileText size={15} className="text-signal" aria-hidden="true" />
        <p className="text-sm text-text-primary">{report.summary}</p>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <RiskBadge tier={report.riskTier} />
      </div>

      {topRisks && (
        <div className="mb-2 text-xs">
          <span className="font-semibold uppercase tracking-wide text-text-tertiary">Top risks: </span>
          <span className="text-text-secondary">{topRisks.body}</span>
        </div>
      )}

      <p className="text-sm text-text-secondary">{report.expectedOutcome}</p>
    </Card>
  );
}
