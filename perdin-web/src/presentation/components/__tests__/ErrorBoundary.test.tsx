import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error on render
function ThrowingComponent({ error }: { error: Error }): React.ReactNode {
  throw error;
}

// Component that renders normally
function NormalComponent() {
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress React error boundary console.error output in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders app-level fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary level="app">
        <ThrowingComponent error={new Error('Test error')} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('renders page-level fallback UI when level is page', () => {
    render(
      <ErrorBoundary level="page">
        <ThrowingComponent error={new Error('Page error')} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Page error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('recovers from error when Try again is clicked (page level)', async () => {
    const user = userEvent.setup();

    // Use a component that can toggle between throwing and not
    let shouldThrow = true;

    function ConditionalThrow() {
      if (shouldThrow) {
        throw new Error('Conditional error');
      }
      return <div>Recovered content</div>;
    }

    render(
      <ErrorBoundary level="page">
        <ConditionalThrow />
      </ErrorBoundary>,
    );

    // Should show error fallback
    expect(screen.getByText('Page error')).toBeInTheDocument();

    // Fix the error condition
    shouldThrow = false;

    // Click Try again
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    // Should recover and show content
    expect(screen.getByText('Recovered content')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent error={new Error('Test')} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('logs error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary level="app">
        <ThrowingComponent error={new Error('Logged error')} />
      </ErrorBoundary>,
    );

    // React and our componentDidCatch both call console.error
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
