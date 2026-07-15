// Prompt architecture stub — GenAI Architecture Addendum v1.1 §7.
// Each agent's template is assembled from 5 fixed sections at call time by the
// orchestrator: System Prompt, Context, Operational Data, Constraints, Expected JSON.
// This file defines the section constants; actual Gemini calls happen server-side
// in the corresponding Supabase Edge Function under supabase/functions/.

export const volunteerAgentSystemPrompt = `Define this agent's role, domain boundaries, and
grounding constraints here. Never invent facts not present in the provided context.`;

export const volunteerAgentExpectedJsonSchemaNote =
  'Must conform to the shared AIAgentResponse contract (src/types/ai.ts).';
