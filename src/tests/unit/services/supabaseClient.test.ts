import { describe, it, expect } from 'vitest';

// Regression coverage for a real crash bug: supabase-js's createClient()
// throws synchronously for a non-URL string. Following this project's own
// README setup step (`cp .env.example .env`) without editing values leaves
// VITE_SUPABASE_URL set to the literal placeholder text
// "your-supabase-project-url", which previously crashed the whole app at
// import time instead of falling back to mock data as documented.
describe('supabaseClient', () => {
  it('does not throw when env vars are unset or still contain .env.example placeholder text', async () => {
    await expect(import('@/services/supabaseClient')).resolves.toBeDefined();
  });

  it('reports isSupabaseConfigured as false when running against the placeholder .env values', async () => {
    const { isSupabaseConfigured } = await import('@/services/supabaseClient');
    // The test environment's .env carries the literal placeholder text
    // committed alongside .env.example — this must be treated as "not configured".
    expect(isSupabaseConfigured).toBe(false);
  });

  it('still exports a usable supabase client instance even when unconfigured', async () => {
    const { supabase } = await import('@/services/supabaseClient');
    expect(supabase).toBeDefined();
    expect(typeof supabase.functions.invoke).toBe('function');
  });
});
