import Button from '@mui/material/Button';
import { StateBlock } from '@repo-radar/ui';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Last line of defence for render-time bugs. Data-fetching failures are handled
 * locally by each query, so reaching this boundary means a real defect.
 */
export class AppErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error', error, info.componentStack);
  }

  private readonly reset = () => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;

    if (error === null) return this.props.children;

    return (
      <StateBlock
        variant="error"
        title="Something went wrong"
        description={error.message}
        action={
          <Button variant="outlined" onClick={this.reset}>
            Try again
          </Button>
        }
      />
    );
  }
}
