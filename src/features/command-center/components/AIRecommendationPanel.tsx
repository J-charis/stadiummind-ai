import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader } from '@/components/ui/Loader';
import { useAIRecommendations } from '@/api/aiRecommendations.api';
import { useUIStore } from '@/store/uiStore';
import { Sparkles } from 'lucide-react';

/** Renders the live stream of AI-generated recommendations — the "AI panel". */
export function AIRecommendationPanel() {
  const { data: recommendations, isLoading } = useAIRecommendations();
  const agentThinking = useUIStore((s) => s.activeAgentThinking);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI recommendations</CardTitle>
        {agentThinking && <Loader label="Reasoning" />}
      </CardHeader>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {!isLoading && recommendations?.length === 0 && (
        <EmptyState
          icon={<Sparkles size={24} aria-hidden="true" />}
          title="No active recommendations"
          description="The AI Orchestrator is monitoring operations continuously. Recommendations will appear here the moment they're needed."
        />
      )}

      {!isLoading && recommendations && recommendations.length > 0 && (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <AIInsightCard key={rec.id} response={rec} interactive />
          ))}
        </div>
      )}
    </Card>
  );
}
