import {
  OperationalOverview,
  IncidentFeed,
  AIRecommendationPanel,
  DecisionTimeline,
  DigitalTwinPreview,
  SituationReportPanel,
} from '@/features/command-center';
import { ReportGeneratorButton } from '@/features/reports';

export default function CommandCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Command Center</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live operational overview, AI-generated recommendations, and the decision timeline.
          </p>
        </div>
        <div className="flex gap-2">
          <ReportGeneratorButton reportType="handover" />
          <ReportGeneratorButton reportType="briefing" />
        </div>
      </div>

      <OperationalOverview />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AIRecommendationPanel />
          <IncidentFeed />
        </div>
        <div className="space-y-6">
          <SituationReportPanel />
          <DigitalTwinPreview />
          <DecisionTimeline />
        </div>
      </div>
    </div>
  );
}
