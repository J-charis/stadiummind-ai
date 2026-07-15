import { TaskList, IncidentReportForm } from '@/features/volunteer-copilot';
import { AIRecommendationPanel } from '@/features/command-center';

export default function VolunteerCopilotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">Volunteer Copilot</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Task assignments, navigation, and AI guidance for your shift.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <TaskList />
          <IncidentReportForm />
        </div>
        <AIRecommendationPanel />
      </div>
    </div>
  );
}
