import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout-primitives/Sidebar';
import { Topbar } from '@/components/layout-primitives/Topbar';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { PageLoader } from '@/components/feedback/PageLoader';
import { useSimulationClock } from '@/features/simulation-lab';

/** Shell for staff-facing modules: sidebar + topbar + routed content. */
export function OperationsLayout() {
  // Runs the deterministic simulation clock regardless of which module is
  // open, so a scenario triggered from Simulation Lab keeps propagating to
  // Command Center / Digital Twin / Volunteer Copilot even after navigating
  // away (Blueprint §9 dashboard integration requirement).
  useSimulationClock();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
