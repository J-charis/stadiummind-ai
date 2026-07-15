import { Wrench } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { ROLE_LABELS } from '@/constants/roles';
import type { UserRole } from '@/types/domain';

const ALL_ROLES: UserRole[] = ['ops_manager', 'security', 'medical', 'volunteer', 'fan'];

/**
 * Instant role switching for demos (implementation §10). Only rendered in
 * development mode (import.meta.env.DEV) — never shipped to production
 * builds. Bypasses login entirely; sets sessionStore directly.
 */
export function DevRoleSwitcher() {
  const role = useSessionStore((s) => s.role);
  const setSession = useSessionStore((s) => s.setSession);
  const setAnonymousFan = useSessionStore((s) => s.setAnonymousFan);

  if (!import.meta.env.DEV) return null;

  function switchTo(nextRole: UserRole) {
    if (nextRole === 'fan') {
      setAnonymousFan();
      return;
    }
    setSession({
      id: `dev-${nextRole}`,
      email: `${nextRole}@demo.stadiummind.ai`,
      fullName: ROLE_LABELS[nextRole],
      role: nextRole,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-raised px-2 py-1.5 shadow-xl">
      <span className="flex items-center gap-1 pl-1.5 text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
        <Wrench size={11} aria-hidden="true" />
        Demo
      </span>
      {ALL_ROLES.map((r) => (
        <button
          key={r}
          onClick={() => switchTo(r)}
          aria-pressed={role === r}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            role === r ? 'bg-signal text-surface-base' : 'text-text-secondary hover:bg-surface-overlay'
          }`}
        >
          {ROLE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}
