// Supabase Edge Function: gemini-gateway
//
// Single server-side entry point to the real Gemini 2.5 Flash API. Reads
// GEMINI_API_KEY exclusively from Edge Function secrets (never sent to or
// readable by the client) — this is what lets GeminiService.generate() in
// src/services/ai/geminiService.ts call "Gemini" from the browser without
// ever holding a key client-side.
//
// Deploy: supabase functions deploy gemini-gateway
// Secret: supabase secrets set GEMINI_API_KEY=your-key-here

interface GeminiRequestBody {
  systemPrompt: string;
  contextJson: string;
  operationalDataJson: string;
  constraints: string[];
  expectedJsonSchemaNote: string;
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    // No key configured — signal failure so the client's Fallback Engine
    // takes over deterministically rather than the request hanging.
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 503 });
  }

  let body: GeminiRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const prompt = [
    body.systemPrompt,
    `Operational Context: ${body.contextJson}`,
    `Operational Data: ${body.operationalDataJson}`,
    `Constraints: ${body.constraints.join('; ')}`,
    `Expected output: ${body.expectedJsonSchemaNote}`,
    'Respond with valid JSON only, no markdown fences, no preamble.',
  ].join('\n\n');

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Gemini API error: ${response.status}` }), {
        status: 502,
      });
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Gateway failure: ${String(err)}` }), { status: 502 });
  }
});
