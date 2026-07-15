import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SignalMark } from '@/components/layout-primitives/SignalMark';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ROUTES } from '@/constants/routes';

/** Shell for the fan-facing, public side of the app. */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface-base">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link to={ROUTES.landing} className="flex items-center gap-2.5">
          <SignalMark size={20} />
          <span className="font-display text-sm font-semibold text-text-primary">
            StadiumMind<span className="text-signal"> AI</span>
          </span>
        </Link>
        <Link
          to={ROUTES.login}
          className="text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Staff sign in
        </Link>
      </header>
      <main>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
