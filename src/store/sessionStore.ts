import { create } from 'zustand';
import type { AppUser, UserRole } from '@/types/domain';

interface SessionState {
  user: AppUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAnonymousFan: boolean;
  setSession: (user: AppUser) => void;
  setAnonymousFan: () => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isAnonymousFan: false,
  setSession: (user) =>
    set({ user, role: user.role, isAuthenticated: true, isAnonymousFan: false }),
  setAnonymousFan: () =>
    set({
      user: null,
      role: 'fan',
      isAuthenticated: true,
      isAnonymousFan: true,
    }),
  clearSession: () =>
    set({ user: null, role: null, isAuthenticated: false, isAnonymousFan: false }),
}));
