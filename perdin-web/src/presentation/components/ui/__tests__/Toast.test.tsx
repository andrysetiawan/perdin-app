import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Toast, ToastContainer } from '../Toast';

describe('Toast', () => {
  const baseNotification = {
    id: '1',
    type: 'success' as const,
    message: 'Operation completed',
  };

  it('renders the notification message', () => {
    render(<Toast notification={baseNotification} onDismiss={vi.fn()} />);
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('applies green border for success type', () => {
    render(<Toast notification={baseNotification} onDismiss={vi.fn()} />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-l-green-500');
  });

  it('applies red border for error type', () => {
    const notification = { ...baseNotification, type: 'error' as const };
    render(<Toast notification={notification} onDismiss={vi.fn()} />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-l-red-500');
  });

  it('applies yellow border for warning type', () => {
    const notification = { ...baseNotification, type: 'warning' as const };
    render(<Toast notification={notification} onDismiss={vi.fn()} />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-l-yellow-500');
  });

  it('applies blue border for info type', () => {
    const notification = { ...baseNotification, type: 'info' as const };
    render(<Toast notification={notification} onDismiss={vi.fn()} />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('border-l-blue-500');
  });

  it('calls onDismiss with notification id when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toast notification={baseNotification} onDismiss={onDismiss} />);
    await user.click(screen.getByLabelText('Dismiss notification'));
    expect(onDismiss).toHaveBeenCalledWith('1');
  });
});

describe('ToastContainer', () => {
  it('renders nothing when notifications array is empty', () => {
    const { container } = render(
      <ToastContainer notifications={[]} onDismiss={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders multiple notifications', () => {
    const notifications = [
      { id: '1', type: 'success' as const, message: 'Created' },
      { id: '2', type: 'error' as const, message: 'Failed' },
    ];
    render(<ToastContainer notifications={notifications} onDismiss={vi.fn()} />);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });
});
