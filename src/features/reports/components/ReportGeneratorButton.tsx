import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Alert } from '@/components/ui/Alert';
import { useGenerateReport } from '@/api/reports.api';
import { reportToMarkdown, downloadMarkdown } from '@/utils/reportMarkdown';
import type { ReportType } from '@/services/ai/agents/operationalReportAgent';
import type { OperationalReportPayload } from '@/types/ai';

const LABELS: Record<ReportType, { button: string; title: string; filePrefix: string }> = {
  situation: { button: 'Generate Situation Report', title: 'Situation Report', filePrefix: 'situation-report' },
  briefing: { button: 'Generate Briefing', title: 'Operational Briefing', filePrefix: 'briefing' },
  handover: { button: 'Generate Shift Handover', title: 'Shift Handover Report', filePrefix: 'shift-handover' },
  post_match: { button: 'Generate Post-Match Report', title: 'Post-Match Report', filePrefix: 'post-match-report' },
};

/**
 * Triggers report generation (Shift Handover §3, Post-Match §4, or ad hoc
 * briefings) and displays the result in a printable, markdown-exportable
 * modal.
 */
export function ReportGeneratorButton({ reportType }: { reportType: ReportType }) {
  const [open, setOpen] = useState(false);
  const { mutate, data: report, isPending, error, reset } = useGenerateReport();
  const labels = LABELS[reportType];

  function handleGenerate() {
    setOpen(true);
    reset();
    mutate(reportType);
  }

  const payload = report ? (report.payload as unknown as OperationalReportPayload) : null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={handleGenerate} disabled={isPending}>
        {isPending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <FileText size={14} aria-hidden="true" />}
        {labels.button}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={labels.title}>
        {isPending && <p className="text-sm text-text-secondary">Generating report from live operational context…</p>}

        {error && <Alert tone="danger">Failed to generate report. Please try again.</Alert>}

        {report && payload && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">{report.summary}</p>
              <RiskBadge tier={report.riskTier} />
            </div>
            {payload.sections.map((section) => (
              <div key={section.heading}>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  {section.heading}
                </div>
                <p className="whitespace-pre-line text-sm text-text-secondary">{section.body}</p>
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <Button
                size="sm"
                onClick={() => downloadMarkdown(`${labels.filePrefix}-${Date.now()}.md`, reportToMarkdown(report))}
              >
                <Download size={14} aria-hidden="true" />
                Download as markdown
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
