import { create } from 'zustand';
import type { SimulationScenario, SimulationStatus } from '@/types/domain';

export interface TimelineEntry {
  id: string;
  timestamp: string;
  label: string;
  kind: 'detection' | 'metric' | 'risk' | 'ai_recommendation' | 'volunteer_task' | 'resolution';
}

interface SimulationState {
  activeSimulationId: string | null;
  activeScenario: SimulationScenario | null;
  status: SimulationStatus;
  elapsedSimMinutes: number;
  /** Wall-clock ms when the simulation started — anchors deterministic snapshot timing. */
  startTimeMs: number | null;
  timeline: TimelineEntry[];
  startSimulation: (id: string, scenario: SimulationScenario) => void;
  advanceTick: (minutes: number) => void;
  resolveSimulation: () => void;
  resetSimulation: () => void;
  pushTimelineEntry: (entry: Omit<TimelineEntry, 'id'>) => void;
}

let timelineCounter = 0;

export const useSimulationStore = create<SimulationState>((set) => ({
  activeSimulationId: null,
  activeScenario: null,
  status: 'idle',
  elapsedSimMinutes: 0,
  startTimeMs: null,
  timeline: [],
  startSimulation: (id, scenario) =>
    set({
      activeSimulationId: id,
      activeScenario: scenario,
      status: 'running',
      elapsedSimMinutes: 0,
      startTimeMs: Date.now(),
      timeline: [
        {
          id: `tl-${timelineCounter++}`,
          timestamp: new Date().toISOString(),
          label: `${scenario.replace(/_/g, ' ')} detected`,
          kind: 'detection',
        },
      ],
    }),
  advanceTick: (minutes) =>
    set((state) => ({ elapsedSimMinutes: state.elapsedSimMinutes + minutes })),
  resolveSimulation: () =>
    set((state) => ({
      status: 'resolved',
      timeline: [
        ...state.timeline,
        {
          id: `tl-${timelineCounter++}`,
          timestamp: new Date().toISOString(),
          label: 'Simulation resolved — operations returning to baseline',
          kind: 'resolution',
        },
      ],
    })),
  resetSimulation: () =>
    set({
      activeSimulationId: null,
      activeScenario: null,
      status: 'idle',
      elapsedSimMinutes: 0,
      startTimeMs: null,
      timeline: [],
    }),
  pushTimelineEntry: (entry) =>
    set((state) => ({
      timeline: [...state.timeline, { ...entry, id: `tl-${timelineCounter++}` }],
    })),
}));
