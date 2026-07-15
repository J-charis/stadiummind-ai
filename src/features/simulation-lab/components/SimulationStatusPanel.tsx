import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSimulationStore } from '@/store/simulationStore';
import { FlaskConical } from 'lucide-react';

const SCENARIO_LABELS: Record<string, string> = {
  heavy_rain: 'Heavy Rain',
  gate_closure: 'Gate Closure',
  metro_delay: 'Metro Delay',
  medical_emergency: 'Medical Emergency',
  vip_arrival: 'VIP Arrival',
  crowd_surge: 'Crowd Surge',
};

export function SimulationStatusPanel() {
  const { activeScenario, status, elapsedSimMinutes } = useSimulationStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation status</CardTitle>
        {status !== 'idle' && (
          <Badge tone={status === 'running' ? 'signal' : 'low'}>{status}</Badge>
        )}
      </CardHeader>

      {status === 'idle' && (
        <EmptyState
          icon={<FlaskConical size={24} aria-hidden="true" />}
          title="No simulation running"
          description="Trigger a scenario above to watch the AI reasoning chain propagate live across every module."
        />
      )}

      {status !== 'idle' && activeScenario && (
        <div className="space-y-2 text-sm">
          <p className="text-text-primary">
            <span className="font-medium">{SCENARIO_LABELS[activeScenario]}</span> scenario{' '}
            {status === 'running' ? 'is active' : 'has resolved'}.
          </p>
          <p className="text-text-secondary">Elapsed simulated time: {elapsedSimMinutes} min</p>
        </div>
      )}
    </Card>
  );
}
