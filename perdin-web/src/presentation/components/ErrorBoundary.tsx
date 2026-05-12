import { Component, type ErrorInfo, type ReactNode } from 'react';

// --- Types ---

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI. If not provided, a default fallback is shown. */
  fallback?: ReactNode;
  /** Optional level identifier for logging purposes */
  level?: 'app' | 'page';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// --- Default Fallback UI ---

function DefaultFallback({ onReload }: { onReload: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8" role="alert">
      <div className="text-center">
        <div className="mb-4 text-5xl" aria-hidden="true">
          ⚠️
        </div>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="mb-6 text-sm text-gray-600">
          An unexpected error occurred. Please try reloading the page.
        </p>
        <button
          onClick={onReload}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

// --- Page-Level Fallback UI ---

function PageFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-6" role="alert">
      <div className="text-center">
        <div className="mb-3 text-4xl" aria-hidden="true">
          ⚠️
        </div>
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Page error</h2>
        <p className="mb-4 text-sm text-gray-600">
          This section encountered an error. You can try again or navigate to another page.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// --- Error Boundary Component ---

/**
 * React Error Boundary that catches unhandled rendering errors.
 * Provides a fallback UI with a reload/retry button.
 *
 * Usage:
 * - App level: <ErrorBoundary level="app">...</ErrorBoundary>
 * - Page level: <ErrorBoundary level="page">...</ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const level = this.props.level ?? 'app';
    console.error(`[ErrorBoundary:${level}] Uncaught error:`, error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const level = this.props.level ?? 'app';

      if (level === 'page') {
        return <PageFallback onRetry={this.handleRetry} />;
      }

      return <DefaultFallback onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}
