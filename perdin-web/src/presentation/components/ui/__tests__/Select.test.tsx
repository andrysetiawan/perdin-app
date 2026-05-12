import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Select } from '../Select';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders with a label', () => {
    render(<Select label="City" options={options} />);
    expect(screen.getByLabelText('City')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select label="City" options={options} />);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('renders placeholder option when provided', () => {
    render(<Select label="City" options={options} placeholder="Select a city" />);
    expect(screen.getByText('Select a city')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('displays error message', () => {
    render(<Select label="City" options={options} error="Required field" />);
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('Required field');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Select label="City" options={options} error="Required" />);
    expect(screen.getByLabelText('City')).toHaveAttribute('aria-invalid', 'true');
  });
});
