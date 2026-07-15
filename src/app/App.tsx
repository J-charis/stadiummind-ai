import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/AppProviders';
import { router } from '@/app/router';
import { DevRoleSwitcher } from '@/features/auth';

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <DevRoleSwitcher />
    </AppProviders>
  );
}
