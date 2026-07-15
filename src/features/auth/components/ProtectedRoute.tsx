import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/store/sessionStore';
import { ROUTES } from '@/constants/routes';
import type { UserRole } from '@/types/domain';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

/**
 * Guards a route by role. Unauthenticated users go to login; authenticated
 * users with the wrong role are sent to their own landing page rather than
 * a bare 403, per Engineering Blueprint §5.
 */
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useSessionStore();
  const location = useLocation();

  if (!isAuthenticated || !role) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    const fallback = role === 'fan' ? ROUTES.assistant : ROUTES.commandCenter;
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
