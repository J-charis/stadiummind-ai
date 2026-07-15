# Problem Statement Alignment — Smart Stadiums & Tournament Operations

StadiumMind AI targets the Smart Stadiums & Tournament Operations challenge:
build a GenAI-enabled architecture that optimizes FIFA World Cup 2026 stadium
operations across **Dynamic Crowd Management**, **Smart Indoor Navigation**,
**Real-Time Decision Support**, and **Multi-language Assistance**. This
document maps each required pillar to the exact modules and files that
implement it, so alignment is verifiable in the code rather than asserted in
prose alone.

## 1. Dynamic Crowd Management

| Requirement | Implementation |
|---|---|
| Live occupancy/queue monitoring | `src/services/simulation/simulationEngine.ts` — `computeSimulationSnapshot` derives per-section occupancy and per-gate queue length deterministically from scenario intensity |
| Congestion forecasting | `src/services/ai/agents/crowdIntelligenceAgent.ts` — Crowd Intelligence Agent, GenAI Addendum §3.1 |
| Threshold-based risk escalation | `src/services/simulation/scenarioDefinitions.ts` — `riskTierFromIntensity`; surfaced live via `RiskBadge` and the Command Center's `OperationalOverview` |
| Gate-level intervention recommendations | `fallbackCrowdIntelligence` (`src/services/ai/fallbackEngine.ts`) and the Crowd Intelligence Agent's Gemini path both recommend opening specific closed gates by code/label, grounded in real `gates`/`queueMetrics` data |
| Visual crowd density | `src/features/digital-twin/components/StadiumSvgCanvas.tsx` — animated, color-coded, per-zone occupancy on the interactive stadium map |

## 2. Smart Indoor Navigation

| Requirement | Implementation |
|---|---|
| Adaptive routing | `src/services/ai/agents/navigationAgent.ts` — Navigation Agent, explicitly consumes the Crowd Intelligence Agent's congestion forecast as an input constraint rather than recomputing it, so routes stay consistent with live crowd state (GenAI Addendum §3.2) |
| Multiple route types | `RouteType` (`src/types/domain.ts`): fastest / shortest / accessible / least_crowded |
| Least-crowded gate selection | `fallbackNavigation` selects the gate with the shortest live queue among open gates |
| Zone-level wayfinding context | `src/features/digital-twin/components/SectionDetailPanel.tsx` — per-zone gate queues, occupancy, and the current AI recommendation for that zone in one drawer |
| Fan-facing navigation queries | `src/features/fan-assistant/` — "seat navigation", "queue recommendations" explicitly supported per the Fan Assistant Agent's operational data (`src/services/ai/agents/fanAssistantAgent.ts`) |

## 3. Real-Time Decision Support

| Requirement | Implementation |
|---|---|
| Central reasoning pipeline | `src/services/ai/orchestrator.ts` — Operational Data → Context Builder → Orchestrator → Agents → Merger → Explainability Layer → Dashboard → Human Decision (GenAI Addendum §2) |
| Explainable recommendations | Every `AIAgentResponse` carries summary, reasoning, confidence, operational impact, alternatives, risks, and expected outcome — enforced by `src/services/ai/schemas.ts`, never optional |
| Human-in-the-loop approval | `src/components/ui/ai-insight-card/` — Approve/Reject actions on every interactive recommendation; nothing is auto-executed |
| Auto-refreshing situation awareness | `src/features/command-center/components/SituationReportPanel.tsx` + `src/api/reports.api.ts` (`useSituationReport`) |
| Operational reporting for handover/post-match decisions | `src/services/ai/agents/operationalReportAgent.ts`, `src/utils/reportMarkdown.ts` |
| Resilience under AI failure | `src/services/ai/fallbackEngine.ts` — every agent has a deterministic, schema-identical fallback; decision support never goes blank because a model call failed |
| Live operational timeline | `src/store/simulationStore.ts` (`timeline`) + `src/features/simulation-lab/components/AITimeline.tsx` |

## 4. Multi-language Assistance

| Requirement | Implementation |
|---|---|
| Multilingual fan chat | `src/features/fan-assistant/components/ChatWindow.tsx` + `LocaleSelector.tsx` |
| Locale-aware AI grounding | `runFanAssistantAgent(gemini, context, query, locale)` (`src/services/ai/agents/fanAssistantAgent.ts`) passes locale through to the agent on every call, not just at chat-session start, so answers stay in the fan's chosen language even as venue state changes |
| Escalation over mistranslation risk in emergencies | Distress-signaling queries set `escalation: true` and are handed to a human/Emergency Response Agent instead of being answered directly in any language — see `fallbackFanAssistant` and `useFanChat` |
| Supported locales (Day 1 scope) | English, Español, Português, Français, العربية — `src/features/fan-assistant/components/LocaleSelector.tsx` |

## Cross-cutting: why this is decision intelligence, not a chatbot

The same `AIAgentResponse` contract and the same `OperationalContext` snapshot
back all four pillars above — a crowd recommendation, a navigation route, a
situation report, and a fan's answer are all instances of one reasoning
pipeline, not four disconnected features. This is asserted architecturally in
`GenAI Architecture Addendum v1.1 §1` and is verifiable by tracing any of the
four table rows above back to `src/services/ai/orchestrator.ts`.
