import { createContext, useEffect, type ReactNode } from 'react';
import { useUIStore } from '@/store/uiStore';

interface ThemeContextValue {
  theme: 'dark' | 'light';
}

export const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark' });

/** Thin wrapper — actual theme state lives in uiStore per Blueprint §6. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}
