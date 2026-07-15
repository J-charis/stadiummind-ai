import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  selectedZoneId: string | null;
  activeAgentThinking: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setSelectedZone: (zoneId: string | null) => void;
  setAgentThinking: (thinking: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  selectedZoneId: null,
  activeAgentThinking: false,
  theme: 'dark',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedZone: (zoneId) => set({ selectedZoneId: zoneId }),
  setAgentThinking: (thinking) => set({ activeAgentThinking: thinking }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
