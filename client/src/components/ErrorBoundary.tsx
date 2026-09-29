import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorState } from './ui/ErrorState';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 'var(--space-8)', maxWidth: '640px', margin: '40px auto' }}>
          <ErrorState
            title="Application Error"
            message={this.state.error?.message || 'An unexpected error crashed this component.'}
            action={
              <Button
                variant="primary"
                leftIcon="refresh"
                onClick={() => window.location.reload()}
              >
                Reload Application
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
