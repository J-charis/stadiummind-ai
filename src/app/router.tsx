import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { OperationsLayout } from '@/layouts/OperationsLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/features/auth';
import { ROUTES } from '@/constants/routes';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const CommandCenterPage = lazy(() => import('@/pages/CommandCenterPage'));
const DigitalTwinPage = lazy(() => import('@/pages/DigitalTwinPage'));
const CrowdIntelligencePage = lazy(() => import('@/pages/CrowdIntelligencePage'));
const VolunteerCopilotPage = lazy(() => import('@/pages/VolunteerCopilotPage'));
const SimulationLabPage = lazy(() => import('@/pages/SimulationLabPage'));
const FanAssistantPage = lazy(() => import('@/pages/FanAssistantPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.landing, element: <LandingPage /> },
      { path: ROUTES.assistant, element: <FanAssistantPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
  {
    element: <OperationsLayout />,
    children: [
      {
        path: ROUTES.commandCenter,
        element: (
          <ProtectedRoute allowedRoles={['ops_manager', 'security', 'medical']}>
            <CommandCenterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.digitalTwin,
        element: (
          <ProtectedRoute allowedRoles={['ops_manager', 'security', 'medical', 'volunteer']}>
            <DigitalTwinPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.crowdIntelligence,
        element: (
          <ProtectedRoute allowedRoles={['ops_manager', 'security']}>
            <CrowdIntelligencePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.volunteer,
        element: (
          <ProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerCopilotPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.simulationLab,
        element: (
          <ProtectedRoute allowedRoles={['ops_manager']}>
            <SimulationLabPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
