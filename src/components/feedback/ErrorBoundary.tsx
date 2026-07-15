import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('StadiumMind AI runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border border-risk-high/30 bg-risk-high-soft p-8 text-center">
          <AlertTriangle className="text-risk-high" size={28} aria-hidden="true" />
          <div className="font-display text-sm font-semibold text-text-primary">
            This section failed to load
          </div>
          <p className="max-w-sm text-sm text-text-secondary">
            Something went wrong rendering this part of the console. Reloading the page usually
            resolves it.
          </p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
