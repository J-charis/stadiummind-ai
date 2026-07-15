import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const SAFE_PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const SAFE_PLACEHOLDER_KEY = 'placeholder-anon-key';

/**
 * `createClient()` validates its URL argument eagerly and throws
 * synchronously if it isn't a well-formed http(s) URL. Following this
 * project's own README setup step (`cp .env.example .env`) without editing
 * the values leaves VITE_SUPABASE_URL set to the literal placeholder text
 * "your-supabase-project-url" — a truthy but invalid URL — which previously
 * crashed the entire app at module-load time instead of falling back to
 * mock data as documented. This guards against that by validating the URL
 * before ever handing it to createClient().
 */
function isValidHttpUrl(candidate: string | undefined): candidate is string {
  if (!candidate) return false;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const hasValidUrl = isValidHttpUrl(rawSupabaseUrl);
const hasKey = Boolean(rawSupabaseAnonKey && rawSupabaseAnonKey !== 'your-supabase-anon-key');

/** True only when both a syntactically valid URL and a real (non-placeholder) key are present. */
export const isSupabaseConfigured = hasValidUrl && hasKey;

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are missing or still set to placeholder values. The app will run against mock data only.',
  );
}

export const supabase = createClient(
  hasValidUrl ? rawSupabaseUrl : SAFE_PLACEHOLDER_URL,
  hasKey ? (rawSupabaseAnonKey as string) : SAFE_PLACEHOLDER_KEY,
);
