import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with status role and loading label', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders screen reader text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const svg = container.querySelector('svg');
    const classAttr = svg?.getAttribute('class') ?? '';
    expect(classAttr).toContain('h-12');
    expect(classAttr).toContain('w-12');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="mt-4" />);
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('mt-4');
  });
});
