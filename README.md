# StadiumMind AI — Day 1 Foundation

Implements Engineering Blueprint v1.0 + GenAI Architecture Addendum v1.1, Day 1 milestone
("Foundation"): project scaffold, full folder structure, routing, auth shell, design system,
Zustand stores, TanStack Query + mock data layer, and every page with a real (non-placeholder)
layout. The app **compiles and runs** end to end.

## Tech versions actually installed (latest stable at time of build)

- React 19.2.7, TypeScript ~6.0, Vite 8.1
- Tailwind CSS 4.3 (CSS-first config via `@theme` in `src/index.css` — no `tailwind.config.js`
  in v4)
- React Router 7.18 (data router)
- TanStack Query 5.101
- Zustand 5.0
- Framer Motion 12.42
- React Hook Form 7.81 + Zod 4.4 + @hookform/resolvers 5.4
- Lucide React, Recharts 3.9
- @supabase/supabase-js 2.110

> Note: Tailwind v4 removed `tailwind.config.js` in favor of CSS-native `@theme` tokens. The
> design system tokens (colors, fonts, animations) live directly in `src/index.css`.

## Install & run

```bash
npm install
cp .env.example .env   # fill in Supabase values when ready — app runs on mock data without them
npm run dev             # http://localhost:5173
```

```bash
npm run build            # tsc -b && vite build → dist/
npm run preview          # serve the production build locally
npm run lint              # oxlint (bundled by the Vite React-TS template)
npm test                  # vitest run — unit + component tests
npm run test:watch        # vitest in watch mode
npm run test:coverage     # vitest run --coverage
```

## Testing

Vitest + React Testing Library, configured in `vitest.config.ts` (merges
`vite.config.ts` so `@/...` aliases resolve identically in tests and in the
app) with jsdom as the test environment. Global setup lives in
`src/tests/setupTests.ts`.

Test coverage focuses on the parts of the system where a silent regression
would be hardest to notice by eye:

- **`src/tests/unit/simulation/`** — the deterministic simulation engine
  (`scenarioDefinitions.ts`, `simulationEngine.ts`): intensity ramp math,
  risk-tier bucketing, and the full incident lifecycle (including a
  regression test for a bug where incidents used to vanish instead of
  showing as resolved).
- **`src/tests/unit/ai/`** — the AI orchestration layer: the Fallback
  Engine's explainability-contract compliance for every agent, the Zod
  Schema Validator's accept/reject behavior, the Gemini response parser's
  resilience to malformed model output, the Operational Context Builder's
  risk-derivation logic, the Recommendation Merger's ranking/conflict
  resolution, and the Orchestrator's end-to-end pipeline ordering (tested
  against a fake `GeminiService` — never the real network).
- **`src/tests/unit/components/`** — shared UI primitives (`Button`,
  `RiskBadge`, `ConfidenceIndicator`, `EmptyState`) and the `AIInsightCard`
  explainability renderer, including its Approve/Reject decision flow
  against the real Zustand stores.
- **`src/tests/unit/services/supabaseClient.test.ts`** — regression coverage
  for a crash bug where following this project's own `cp .env.example .env`
  setup step (without editing the placeholder values) took down the entire
  app at import time.

## What this project is solving

See **`PROBLEM_STATEMENT_ALIGNMENT.md`** for an explicit, file-by-file
mapping from the Smart Stadiums & Tournament Operations challenge's four
required pillars (Dynamic Crowd Management, Smart Indoor Navigation,
Real-Time Decision Support, Multi-language Assistance) to the modules that
implement each one.

## Environment variables

| Variable | Required for Day 1? | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | No — falls back to mock data | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No — falls back to mock data | Supabase anon key |

Server-only secrets (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are **not** in this repo's
`.env` — they belong in Supabase Edge Function secrets once the AI Orchestrator is implemented
(Blueprint §14), never in the client bundle.

## What's implemented in this milestone

- **Full folder structure** exactly matching Engineering Blueprint §2 — every `features/*`,
  `components/*`, `store/*`, `api/*`, `prompts/*`, and `supabase/functions/*` directory exists.
- **Routing** — landing, login, all 6 operational modules, 404, lazy-loaded, role-protected via
  `ProtectedRoute` (redirects unauthenticated users to `/login`, wrong-role users to their own
  landing page, per Blueprint §5/§10).
- **Auth shell** — Supabase client configured (`src/services/supabaseClient.ts`), demo login form
  (role-select), anonymous "Continue as a fan" path, `sessionStore` persisting role client-side.
  Real Supabase email/password + JWT role claims wire in without changing the store contract.
- **Global layout** — enterprise sidebar (role-filtered nav, collapse), topbar (breadcrumbs,
  notifications, theme toggle, user profile), all keyboard-navigable.
- **Design system** — Button, Card, Badge, RiskBadge, ConfidenceIndicator, StatCard, MetricTile,
  Modal, Drawer, Tabs, Tooltip, Alert, Skeleton, Loader, EmptyState, and the shared
  **AIInsightCard** that renders the full explainability contract (summary, reasoning,
  confidence, impact, alternatives, risks, expected outcome) from GenAI Addendum §5.
- **Zustand stores** — `sessionStore`, `uiStore`, `simulationStore`, split by domain per
  Blueprint §6.
- **TanStack Query + mock data** — `api/*.api.ts` hooks (`useSections`, `useGates`,
  `useCrowdMetrics`, `useIncidents`, `useTasks`, `useAIRecommendations`,
  `useStartSimulation`) backed by realistic seed data in `services/mock/`, with polling
  intervals so the dashboard visibly refreshes.
- **All 6 module pages** have real content, not "Coming Soon": Command Center (stat cards, AI
  recommendation panel, incident feed, decision timeline, twin preview), Digital Twin
  (interactive clickable SVG stadium + detail drawer), Crowd Intelligence (Recharts bar chart +
  gate status), Volunteer Copilot (task list), Simulation Lab (scenario trigger grid + status
  panel), Fan Assistant (working chat UI with locale selector).
- **Landing page** — animated ambient hero, feature grid, 6-stage architecture pipeline diagram,
  footer.
- **Accessibility** — visible focus rings (`:focus-visible` globally), ARIA labels/roles on
  interactive SVG nodes, modals, drawers, tabs, and meters; `prefers-reduced-motion` respected;
  risk is always icon + label, never color alone.
- **Typecheck & build verified**: `npx tsc -b` and `npm run build` both pass clean, strict mode,
  zero `any`.

## What's intentionally stubbed for later milestones

- `supabase/functions/*` — each Edge Function returns a placeholder JSON response. The AI
  Orchestrator, agents, and simulation-tick logic (GenAI Addendum §2–§9) are Day 3–5 work.
- `supabase/migrations/` — empty; the schema from Blueprint §7 has not yet been applied to a real
  Postgres instance. The app runs entirely on `services/mock/*` until then.
- Prompt templates in `src/prompts/` are structural stubs (section constants), not full prompts,
  per the addendum's explicit "define the architecture, not the prompts" instruction.
- Test files under `src/tests/` are directories only — the testing strategy (Blueprint §13) is
  implemented starting Day 6.

## Common issues

- **`npm install` warns about peer deps for `@hookform/resolvers`** — harmless; Zod 4 and
  resolvers 5 are compatible, npm's peer-range metadata just lags releases.
- **Blank page in dev with a Supabase console warning** — expected until `.env` is filled in;
  the app intentionally still runs on mock data (`isSupabaseConfigured` guards this).
- **Tailwind classes not applying** — remember there is no `tailwind.config.js` in this v4 setup;
  new design tokens go in the `@theme` block in `src/index.css`, not a JS config file.
- **Path alias `@/...` not resolving in an editor** — restart the TS server; `paths` is declared
  in both `tsconfig.json` and `tsconfig.app.json`, and mirrored in `vite.config.ts`.

## Expected result when you run `npm run dev`

- `/` — dark enterprise landing page with animated hero, feature grid, pipeline diagram.
- `/login` — role-select sign-in form + "Continue as a fan" link.
- `/command-center`, `/digital-twin`, `/crowd-intelligence`, `/volunteer`, `/simulation-lab` —
  full sidebar/topbar shell, live (mock) data, all functional (click a zone on the Digital Twin,
  trigger a scenario in Simulation Lab, expand an AIInsightCard for alternatives/risks).
- `/assistant` — public fan-facing chat, works without logging in.
