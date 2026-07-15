import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIInsightCard } from '@/components/ui/AIInsightCard';
import { useRecommendationHistoryStore } from '@/store/recommendationHistoryStore';
import { useSimulationStore } from '@/store/simulationStore';
import type { AIAgentResponse } from '@/types/ai';

function makeResponse(overrides: Partial<AIAgentResponse> = {}): AIAgentResponse {
  return {
    id: 'rec-1',
    agentType: 'crowd_intelligence',
    summary: 'Open Gate 6 to relieve congestion',
    reasoning: 'Gate 4 queue exceeds throughput by 38%.',
    confidenceScore: 0.87,
    operationalImpact: { metric: 'congestion', projectedChange: '-28%', etaMinutes: 10 },
    alternativeActions: [
      { id: 'alt-1', label: 'Redirect via signage', description: 'Lower-cost, slower effect.' },
    ],
    potentialRisks: ['Requires staffing Gate 6 temporarily.'],
    expectedOutcome: 'Queue wait falls within 10 minutes.',
    riskTier: 'high',
    createdAt: new Date().toISOString(),
    payload: { sectionId: 'sec-a' },
    isFallback: false,
    ...overrides,
  };
}

// Reset shared zustand stores between tests since they're module-level
// singletons — without this, approve/reject state would leak across tests.
beforeEach(() => {
  useRecommendationHistoryStore.setState({
    history: [],
    approvedIds: new Set(),
    rejectedIds: new Set(),
  });
  useSimulationStore.getState().resetSimulation();
});

describe('AIInsightCard', () => {
  it('renders every field of the explainability contract: summary, reasoning, confidence, and impact', () => {
    render(<AIInsightCard response={makeResponse()} />);

    expect(screen.getByText('Open Gate 6 to relieve congestion')).toBeInTheDocument();
    expect(screen.getByText('Gate 4 queue exceeds throughput by 38%.')).toBeInTheDocument();
    expect(screen.getByText('87% confidence')).toBeInTheDocument();
    expect(screen.getByText(/congestion: -28%/)).toBeInTheDocument();
  });

  it('marks details as collapsed via aria-expanded until "View details" is clicked', async () => {
    const user = userEvent.setup();
    render(<AIInsightCard response={makeResponse()} />);

    const toggle = screen.getByRole('button', { name: /view details/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Redirect via signage')).toBeInTheDocument();
    expect(screen.getByText('Requires staffing Gate 6 temporarily.')).toBeInTheDocument();
    expect(screen.getByText('Queue wait falls within 10 minutes.')).toBeInTheDocument();
  });

  it('does not render Approve/Reject actions when not interactive', () => {
    render(<AIInsightCard response={makeResponse()} />);
    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
  });

  it('approving a recommendation records it in recommendationHistoryStore and swaps in an Approved badge', async () => {
    const user = userEvent.setup();
    const response = makeResponse();
    render(<AIInsightCard response={response} interactive />);

    await user.click(screen.getByRole('button', { name: /^approve$/i }));

    expect(useRecommendationHistoryStore.getState().approvedIds.has(response.id)).toBe(true);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^approve$/i })).not.toBeInTheDocument();
  });

  it('rejecting a recommendation records it and swaps in a Dismissed badge', async () => {
    const user = userEvent.setup();
    const response = makeResponse();
    render(<AIInsightCard response={response} interactive />);

    await user.click(screen.getByRole('button', { name: /reject/i }));

    expect(useRecommendationHistoryStore.getState().rejectedIds.has(response.id)).toBe(true);
    expect(screen.getByText('Dismissed')).toBeInTheDocument();
  });

  it('approving pushes a timeline entry documenting the human decision', async () => {
    const user = userEvent.setup();
    render(<AIInsightCard response={makeResponse()} interactive />);

    await user.click(screen.getByRole('button', { name: /^approve$/i }));

    const timeline = useSimulationStore.getState().timeline;
    expect(timeline.some((entry) => entry.label.includes('Recommendation approved'))).toBe(true);
  });

  it('indicates fallback-generated reasoning distinctly from live Gemini output', () => {
    render(<AIInsightCard response={makeResponse({ isFallback: true })} />);
    expect(screen.getByText(/fallback reasoning/)).toBeInTheDocument();
  });
});
