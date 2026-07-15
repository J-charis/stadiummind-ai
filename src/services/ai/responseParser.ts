// Response Parser — GenAI Architecture Addendum §7/§8.
// Takes raw Gemini text (which may include stray whitespace, markdown fences,
// or preamble) and attempts to extract a JSON object. Never throws — returns
// null on failure so the Fallback Engine can take over.

export function parseGeminiJson(rawText: string): unknown | null {
  const stripped = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '');

  try {
    return JSON.parse(stripped);
  } catch {
    // Attempt to salvage a JSON object embedded in surrounding prose.
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
