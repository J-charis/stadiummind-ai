import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(<EmptyState title="No incidents reported" description="All clear right now." />);
    expect(screen.getByText('No incidents reported')).toBeInTheDocument();
    expect(screen.getByText('All clear right now.')).toBeInTheDocument();
  });

  it('renders an optional action element when provided', () => {
    render(
      <EmptyState
        title="No tasks"
        description="Nothing assigned yet."
        action={<button>Refresh</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});
