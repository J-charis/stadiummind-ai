import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBadge } from '@/components/ui/RiskBadge';

// Risk must never be communicated by color alone (accessibility requirement,
// Blueprint §12) — these tests assert a text label is always present
// alongside the icon for every risk tier.
describe('RiskBadge', () => {
  it.each([
    ['low', 'Low risk'],
    ['medium', 'Medium risk'],
    ['high', 'High risk'],
    ['critical', 'Critical'],
  ] as const)('renders a readable text label for tier "%s"', (tier, expectedLabel) => {
    render(<RiskBadge tier={tier} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
