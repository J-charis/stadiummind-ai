import { CloudRain, DoorClosed, TrainFront, Siren, Crown, Users2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStartSimulation } from '@/api/simulations.api';
import { useSimulationStore } from '@/store/simulationStore';
import type { SimulationScenario } from '@/types/domain';

const SCENARIOS: { id: SimulationScenario; label: string; icon: typeof CloudRain; description: string }[] = [
  { id: 'heavy_rain', label: 'Heavy Rain', icon: CloudRain, description: 'Reduced outdoor flow, indoor demand spike' },
  { id: 'gate_closure', label: 'Gate Closure', icon: DoorClosed, description: 'Redistributed load on remaining gates' },
  { id: 'metro_delay', label: 'Metro Delay', icon: TrainFront, description: 'Sudden inflow spike at affected gates' },
  { id: 'medical_emergency', label: 'Medical Emergency', icon: Siren, description: 'Resource dispatch and evacuation-adjacent routing' },
  { id: 'vip_arrival', label: 'VIP Arrival', icon: Crown, description: 'Temporary route restriction and security posture' },
  { id: 'crowd_surge', label: 'Crowd Surge', icon: Users2, description: 'Rapid occupancy escalation, critical risk tier' },
];

export function ScenarioTriggerGrid() {
  const { mutate: startSimulation, isPending } = useStartSimulation();
  const activeScenario = useSimulationStore((s) => s.activeScenario);
  const status = useSimulationStore((s) => s.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger a scenario</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((scenario) => {
          const isActive = activeScenario === scenario.id && status === 'running';
          return (
            <button
              key={scenario.id}
              onClick={() => startSimulation(scenario.id)}
              disabled={isPending || status === 'running'}
              className="flex flex-col items-start gap-2 rounded-lg border border-border bg-surface-overlay p-4 text-left transition-colors hover:border-signal-dim disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-soft text-signal">
                <scenario.icon size={17} aria-hidden="true" />
              </span>
              <span className="font-display text-sm font-semibold text-text-primary">
                {scenario.label}
              </span>
              <span className="text-xs text-text-secondary">{scenario.description}</span>
              {isActive && (
                <span className="mt-1 text-xs font-medium text-signal">Running…</span>
              )}
            </button>
          );
        })}
      </div>
      {status === 'running' && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => useSimulationStore.getState().resolveSimulation()}
          >
            Resolve simulation
          </Button>
        </div>
      )}
    </Card>
  );
}
