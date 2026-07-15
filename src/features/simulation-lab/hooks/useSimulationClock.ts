import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { computeSimulationSnapshot } from '@/services/simulation/simulationEngine';
import { SCENARIO_DEFINITIONS } from '@/services/simulation/scenarioDefinitions';

const TICK_INTERVAL_MS = 1500; // real seconds between simulated-minute ticks
const MINUTES_PER_TICK = 1;

/**
 * Drives the simulation forward in real time. Each tick advances elapsed
 * simulated minutes deterministically and appends timeline entries at risk
 * transitions ("Crowd increasing", "Risk HIGH", etc.), producing the live
 * operational timeline required by GenAI Addendum §2 / implementation §8.
 * Auto-resolves once the scenario's deterministic decay reaches baseline.
 */
export function useSimulationClock() {
  const lastRiskTierRef = useRef<string | null>(null);

  const status = useSimulationStore((s) => s.status);
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);
  const activeScenario = useSimulationStore((s) => s.activeScenario);
  const elapsedSimMinutes = useSimulationStore((s) => s.elapsedSimMinutes);
  const startTimeMs = useSimulationStore((s) => s.startTimeMs);
  const advanceTick = useSimulationStore((s) => s.advanceTick);
  const resolveSimulation = useSimulationStore((s) => s.resolveSimulation);
  const pushTimelineEntry = useSimulationStore((s) => s.pushTimelineEntry);

  useEffect(() => {
    if (status !== 'running' || !activeSimulationId || !activeScenario || !startTimeMs) return;

    const interval = setInterval(() => {
      const nextMinute = elapsedSimMinutes + MINUTES_PER_TICK;
      const snapshot = computeSimulationSnapshot(
        activeSimulationId,
        activeScenario,
        nextMinute,
        startTimeMs,
      );
      const def = SCENARIO_DEFINITIONS[activeScenario];

      if (lastRiskTierRef.current !== snapshot.riskTier) {
        pushTimelineEntry({
          timestamp: new Date().toISOString(),
          label:
            snapshot.riskTier === 'low' && lastRiskTierRef.current !== null
              ? 'Crowd levels stabilizing'
              : `Risk ${snapshot.riskTier.toUpperCase()}`,
          kind: 'risk',
        });
        lastRiskTierRef.current = snapshot.riskTier;
      } else if (snapshot.intensity > 0 && nextMinute % 3 === 0) {
        pushTimelineEntry({
          timestamp: new Date().toISOString(),
          label: `Crowd ${snapshot.intensity > 0.5 ? 'increasing' : 'shifting'} near ${def.label.toLowerCase()} zone`,
          kind: 'metric',
        });
      }

      advanceTick(MINUTES_PER_TICK);

      if (nextMinute >= def.resolvesAtMinute) {
        resolveSimulation();
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [
    status,
    activeSimulationId,
    activeScenario,
    elapsedSimMinutes,
    startTimeMs,
    advanceTick,
    resolveSimulation,
    pushTimelineEntry,
  ]);
}
