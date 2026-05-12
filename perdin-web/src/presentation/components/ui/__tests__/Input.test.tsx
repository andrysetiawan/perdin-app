import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('displays error message in red', () => {
    render(<Input label="Email" error="Invalid email" />);
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('Invalid email');
    expect(errorMsg.className).toContain('text-red-600');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  it('supports different input types', () => {
    render(<Input label="Password" type="password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('applies error border styling when error is present', () => {
    render(<Input label="Name" error="Too short" />);
    const input = screen.getByLabelText('Name');
    expect(input.className).toContain('border-red-500');
  });
});
