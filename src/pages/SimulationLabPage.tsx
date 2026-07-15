import { ScenarioTriggerGrid, SimulationStatusPanel, AITimeline, DemoScriptRunner } from '@/features/simulation-lab';
import { AIRecommendationPanel } from '@/features/command-center';

export default function SimulationLabPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">Simulation Lab</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Trigger operational scenarios and observe the AI reasoning chain in real time.
        </p>
      </div>

      <DemoScriptRunner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ScenarioTriggerGrid />
          <SimulationStatusPanel />
          <AITimeline />
        </div>
        <AIRecommendationPanel />
      </div>
    </div>
  );
}
