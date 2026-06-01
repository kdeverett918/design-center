import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

// Keeps a render error in one view from blanking the whole app.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface in dev; a real logger (Sentry) can hook in here later.
    console.error('Design Center error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <h2 className="font-display text-2xl font-semibold text-shell-ink">
            Something went sideways.
          </h2>
          <p className="mt-2 text-sm text-shell-mute">
            {this.state.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="mt-5 rounded-full bg-shell-glow px-5 py-2 text-sm font-semibold text-shell-base"
          >
            Back to the gallery
          </button>
        </div>
      </div>
    );
  }
}
