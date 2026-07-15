import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceIndicator } from '@/components/ui/ConfidenceIndicator';

describe('ConfidenceIndicator', () => {
  it('renders the confidence score as a rounded percentage', () => {
    render(<ConfidenceIndicator score={0.87} />);
    expect(screen.getByText('87% confidence')).toBeInTheDocument();
  });

  it('exposes the score via ARIA meter attributes for assistive tech', () => {
    render(<ConfidenceIndicator score={0.5} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('rounds fractional percentages consistently', () => {
    render(<ConfidenceIndicator score={0.755} />);
    expect(screen.getByText('76% confidence')).toBeInTheDocument();
  });
});
