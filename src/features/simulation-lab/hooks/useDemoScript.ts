import { useCallback, useRef, useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';

// Scripted demonstration — implementation milestone §11:
// Metro Delay → Crowd Growth → AI Recommendation → Volunteer Task →
// Gate Opens → Congestion Reduces → Shift Handover → Post-Match Report.
//
// The middle stages (crowd growth, AI recommendation, volunteer task,
// congestion reduction) emerge naturally from the deterministic simulation
// engine + AI orchestrator already wired into every dashboard module; this
// hook only sequences the *demo-specific* steps that need explicit
// triggering (start scenario, then prompt the two report generations once
// the scenario resolves).

export type DemoStage =
  | 'idle'
  | 'running_metro_delay'
  | 'awaiting_resolution'
  | 'ready_for_handover'
  | 'ready_for_post_match'
  | 'complete';

export function useDemoScript() {
  const [stage, setStage] = useState<DemoStage>('idle');
  const pollRef = useRef<number | null>(null);
  const startSimulation = useSimulationStore((s) => s.startSimulation);

  const run = useCallback(() => {
    const id = `demo-sim-${Date.now()}`;
    startSimulation(id, 'metro_delay');
    setStage('running_metro_delay');

    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      const { status } = useSimulationStore.getState();
      if (status === 'resolved') {
        setStage('ready_for_handover');
        if (pollRef.current) window.clearInterval(pollRef.current);
      }
    }, 1000);
  }, [startSimulation]);

  const advanceToPostMatch = useCallback(() => setStage('ready_for_post_match'), []);
  const complete = useCallback(() => setStage('complete'), []);
  const reset = useCallback(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    setStage('idle');
  }, []);

  return { stage, run, advanceToPostMatch, complete, reset };
}
