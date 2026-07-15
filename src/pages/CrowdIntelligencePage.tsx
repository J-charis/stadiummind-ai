import { CongestionChart, GateRecommendationList } from '@/features/crowd-intelligence';
import { AIRecommendationPanel } from '@/features/command-center';

export default function CrowdIntelligencePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">Crowd Intelligence</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Congestion forecasting, flow analysis, and gate-level recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CongestionChart />
          <GateRecommendationList />
        </div>
        <AIRecommendationPanel />
      </div>
    </div>
  );
}
