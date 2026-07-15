import { Languages } from 'lucide-react';
import { useContext } from 'react';
import { LocaleContext } from '@/contexts/LocaleContext';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

export function LocaleSelector() {
  const { locale, setLocale } = useContext(LocaleContext);

  return (
    <label className="flex items-center gap-2 text-sm text-text-secondary">
      <Languages size={16} aria-hidden="true" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        aria-label="Select language"
        className="rounded-lg border border-border-strong bg-surface-overlay px-2.5 py-1.5 text-sm text-text-primary outline-none focus-visible:border-signal"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
