import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SignalMark } from '@/components/layout-primitives/SignalMark';
import { PageLoader } from '@/components/feedback/PageLoader';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <SignalMark size={28} />
          <span className="font-display text-base font-semibold text-text-primary">
            StadiumMind<span className="text-signal"> AI</span>
          </span>
        </div>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
