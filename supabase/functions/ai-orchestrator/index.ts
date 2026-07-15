// Supabase Edge Function: ai-orchestrator
// Implements the corresponding stage of the AI Reasoning Pipeline
// (GenAI Architecture Addendum v1.1 §2). Wired in a later implementation milestone.
// Deploy with: supabase functions deploy ai-orchestrator

Deno.serve(async (_req: Request) => {
  return new Response(JSON.stringify({ status: 'not yet implemented' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
