import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

import { NotificationProvider, useNotificationContext } from './NotificationContext';

function wrapper({ children }: { children: ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with an empty notification list', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });
    expect(result.current.notifications).toEqual([]);
  });

  it('adds a notification with a generated id', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'success', message: 'Created!' });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].message).toBe('Created!');
    expect(result.current.notifications[0].id).toBeTruthy();
  });

  it('removes a notification by id', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'info', message: 'Info message' });
    });

    const id = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(id);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('auto-dismisses success notifications after 5000ms', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'success', message: 'Done!' });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('does not auto-dismiss error notifications', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'error', message: 'Failed!' });
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].autoDismiss).toBe(false);
  });

  it('enforces max 5 notifications, removing oldest when exceeded', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      for (let i = 1; i <= 6; i++) {
        result.current.addNotification({ type: 'error', message: `Notification ${i}` });
      }
    });

    expect(result.current.notifications).toHaveLength(5);
    // Oldest (Notification 1) should be removed
    expect(result.current.notifications[0].message).toBe('Notification 2');
    expect(result.current.notifications[4].message).toBe('Notification 6');
  });

  it('auto-dismisses warning and info notifications by default', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'warning', message: 'Warning!' });
      result.current.addNotification({ type: 'info', message: 'Info!' });
    });

    expect(result.current.notifications[0].autoDismiss).toBe(true);
    expect(result.current.notifications[1].autoDismiss).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('respects explicit autoDismiss override', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'success', message: 'Persistent success', autoDismiss: false });
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Should still be there because autoDismiss was explicitly set to false
    expect(result.current.notifications).toHaveLength(1);
  });

  it('respects custom duration', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'success', message: 'Quick!', duration: 2000 });
    });

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.notifications).toHaveLength(0);
  });

  it('generates unique IDs for each notification', () => {
    const { result } = renderHook(() => useNotificationContext(), { wrapper });

    act(() => {
      result.current.addNotification({ type: 'info', message: 'First' });
      result.current.addNotification({ type: 'info', message: 'Second' });
    });

    const ids = result.current.notifications.map((n) => n.id);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

describe('useNotificationContext', () => {
  it('throws when used outside NotificationProvider', () => {
    expect(() => {
      renderHook(() => useNotificationContext());
    }).toThrow('useNotificationContext must be used within a NotificationProvider');
  });
});
