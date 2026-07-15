import { NavLink } from 'react-router-dom';
import {
  Users,
  LayoutGrid,
  Map,
  Activity,
  MessageCircle,
  FlaskConical,
  ChevronsLeft,
  LogOut,
} from 'lucide-react';
import { SignalMark } from '@/components/layout-primitives/SignalMark';
import { useUIStore } from '@/store/uiStore';
import { useSessionStore } from '@/store/sessionStore';
import { ROLE_LABELS } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import type { UserRole } from '@/types/domain';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.commandCenter, label: 'Command Center', icon: LayoutGrid, roles: ['ops_manager', 'security', 'medical'] },
  { to: ROUTES.digitalTwin, label: 'Digital Twin', icon: Map, roles: ['ops_manager', 'security', 'medical', 'volunteer'] },
  { to: ROUTES.crowdIntelligence, label: 'Crowd Intelligence', icon: Activity, roles: ['ops_manager', 'security'] },
  { to: ROUTES.volunteer, label: 'Volunteer Copilot', icon: Users, roles: ['volunteer'] },
  { to: ROUTES.simulationLab, label: 'Simulation Lab', icon: FlaskConical, roles: ['ops_manager'] },
  { to: ROUTES.assistant, label: 'Fan Assistant', icon: MessageCircle, roles: ['ops_manager', 'security', 'medical', 'volunteer', 'fan'] },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const role = useSessionStore((s) => s.role);
  const clearSession = useSessionStore((s) => s.clearSession);

  const items = NAV_ITEMS.filter((item) => !role || item.roles.includes(role));

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface-raised transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[248px]',
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
        <SignalMark />
        {!collapsed && (
          <span className="font-display text-sm font-semibold tracking-wide text-text-primary">
            StadiumMind<span className="text-signal"> AI</span>
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors',
                'hover:bg-surface-hover hover:text-text-primary',
                isActive && 'bg-signal-soft text-signal',
              )
            }
          >
            <item.icon size={18} aria-hidden="true" className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      <div className="space-y-1 border-t border-border px-2.5 py-3">
        {role && !collapsed && (
          <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-text-tertiary">
            {ROLE_LABELS[role]}
          </div>
        )}
        <button
          onClick={clearSession}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <LogOut size={18} aria-hidden="true" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <ChevronsLeft
            size={18}
            aria-hidden="true"
            className={cn('transition-transform duration-200', collapsed && 'rotate-180')}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </nav>
  );
}
