import { createContext, useState, type ReactNode } from 'react';

interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('en');
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}
