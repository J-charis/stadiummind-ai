import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Open Gate 6</Button>);
    expect(screen.getByRole('button', { name: 'Open Gate 6' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Approve</Button>);

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={onClick} disabled>
        Approve
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is keyboard accessible via Enter', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Approve</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
