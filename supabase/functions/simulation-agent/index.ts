// Supabase Edge Function: simulation-agent
// Implements the corresponding stage of the AI Reasoning Pipeline
// (GenAI Architecture Addendum v1.1 §2). Wired in a later implementation milestone.
// Deploy with: supabase functions deploy simulation-agent

Deno.serve(async (_req: Request) => {
  return new Response(JSON.stringify({ status: 'not yet implemented' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
