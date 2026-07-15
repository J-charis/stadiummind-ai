import { Bell, Sun, Moon } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout-primitives/Breadcrumbs';
import { useUIStore } from '@/store/uiStore';
import { useSessionStore } from '@/store/sessionStore';
import { useAlerts } from '@/api/incidents.api';
import { ROLE_LABELS } from '@/constants/roles';

export function Topbar() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const role = useSessionStore((s) => s.role);
  const user = useSessionStore((s) => s.user);
  const { data: alerts } = useAlerts();

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : role?.slice(0, 2).toUpperCase() ?? 'ST';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface-base px-6">
      <Breadcrumbs />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          aria-label={`Notifications, ${alerts?.length ?? 0} active`}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
        >
          <Bell size={17} />
          {alerts && alerts.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-risk-high" />
          )}
        </button>

        <div className="flex items-center gap-2.5 border-l border-border pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-signal-soft font-mono text-xs font-semibold text-signal">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-medium text-text-primary">
              {user?.fullName ?? 'Guest fan'}
            </div>
            <div className="text-[11px] text-text-tertiary">
              {role ? ROLE_LABELS[role] : 'Not signed in'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
