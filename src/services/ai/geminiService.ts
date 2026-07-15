import { supabase, isSupabaseConfigured } from '@/services/supabaseClient';

// Gemini Service — GenAI Architecture Addendum §7, §8.
// This is the ONLY file that changes when swapping mock ↔ real Gemini calls.
// Every agent depends on this interface, never on Gemini directly (Blueprint
// §9: "No component calls Gemini directly"). The real implementation never
// holds an API key client-side — it invokes the `gemini-gateway` Supabase
// Edge Function, which reads GEMINI_API_KEY from server-only Edge Function
// secrets (Blueprint §14) and proxies the call.

export interface GeminiRequest {
  systemPrompt: string;
  contextJson: string;
  operationalDataJson: string;
  constraints: string[];
  expectedJsonSchemaNote: string;
}

export interface GeminiRawResponse {
  /** Raw text the model returned — may or may not be valid JSON; caller must parse/validate. */
  text: string;
  /** True if this came from a real model call vs. a mocked/synthetic response. */
  isMocked: boolean;
}

export interface GeminiService {
  generate(request: GeminiRequest): Promise<GeminiRawResponse>;
}

/**
 * Mock implementation: returns a synthetic JSON string built by the caller's
 * own deterministic generator, simulating network latency. Used automatically
 * whenever Supabase (and therefore the gemini-gateway function) is not
 * configured, and as the resilience path the Fallback Engine relies on.
 */
export function createMockGeminiService(
  mockResponseFactory: (request: GeminiRequest) => string,
  opts: { latencyMs?: number } = {},
): GeminiService {
  const { latencyMs = 300 } = opts;

  return {
    async generate(request) {
      await new Promise((resolve) => setTimeout(resolve, latencyMs));
      return { text: mockResponseFactory(request), isMocked: true };
    },
  };
}

/**
 * Live implementation. Calls the `gemini-gateway` Edge Function via the
 * Supabase client SDK (which attaches the user's JWT automatically) — no API
 * key is ever present in client code or the network tab. The Edge Function
 * itself owns the real fetch() to the Gemini 2.5 Flash API using
 * `Deno.env.get('GEMINI_API_KEY')`.
 */
export function createLiveGeminiService(): GeminiService {
  return {
    async generate(request) {
      const { data, error } = await supabase.functions.invoke<{ text: string }>('gemini-gateway', {
        body: request,
      });

      if (error || !data?.text) {
        throw new Error(error?.message ?? 'gemini-gateway returned no content');
      }

      return { text: data.text, isMocked: false };
    },
  };
}

/**
 * Resolves the correct GeminiService for the current environment: live when
 * Supabase is configured (so the gateway function is reachable), otherwise
 * the mock. The Fallback Engine (fallbackEngine.ts) still applies on top of
 * whichever service is chosen if the call throws or returns unparseable/
 * schema-invalid content — this function only decides mock vs. live, it
 * never bypasses fallback behaviour.
 */
export function resolveGeminiService(
  mockResponseFactory: (request: GeminiRequest) => string,
): GeminiService {
  return isSupabaseConfigured ? createLiveGeminiService() : createMockGeminiService(mockResponseFactory);
}
