import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import fc from 'fast-check';

import { NotificationProvider, useNotificationContext } from '../NotificationContext';

/**
 * Property 12: Notification queue maximum capacity
 * Validates: Requirements 13.7
 *
 * For any sequence of N toast notifications where N > 5, the notification system
 * SHALL display only the 5 most recently added notifications, removing the oldest
 * notification when the limit is exceeded.
 */

function wrapper({ children }: { children: ReactNode }) {
  return createElement(NotificationProvider, null, children);
}

describe('Feature: perdin-dashboard, Property 12: Notification queue maximum capacity', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('after adding N notifications (N > 5), the queue length is always <= 5', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 20 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('success', 'error', 'warning', 'info'),
            message: fc.string(),
          }),
          { minLength: 6, maxLength: 20 }
        ),
        (n, notifications) => {
          const items = notifications.slice(0, n);
          // Ensure we have at least n items by padding if needed
          while (items.length < n) {
            items.push({ type: 'info', message: `msg-${items.length}` });
          }

          const { result } = renderHook(() => useNotificationContext(), { wrapper });

          act(() => {
            for (const item of items) {
              result.current.addNotification({
                type: item.type as 'success' | 'error' | 'warning' | 'info',
                message: item.message,
                autoDismiss: false,
              });
            }
          });

          expect(result.current.notifications.length).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('after adding N notifications (N > 5), the queue contains the 5 most recently added notifications', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 20 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('success', 'error', 'warning', 'info'),
            message: fc.string(),
          }),
          { minLength: 6, maxLength: 20 }
        ),
        (n, notifications) => {
          const items = notifications.slice(0, n);
          while (items.length < n) {
            items.push({ type: 'info', message: `msg-${items.length}` });
          }

          const { result } = renderHook(() => useNotificationContext(), { wrapper });

          act(() => {
            for (const item of items) {
              result.current.addNotification({
                type: item.type as 'success' | 'error' | 'warning' | 'info',
                message: item.message,
                autoDismiss: false,
              });
            }
          });

          // The queue should contain the last 5 items added
          const expectedMessages = items.slice(-5).map((item) => item.message);
          const actualMessages = result.current.notifications.map((n) => n.message);

          expect(actualMessages).toEqual(expectedMessages);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('after adding N notifications (N <= 5), the queue length equals N', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('success', 'error', 'warning', 'info'),
            message: fc.string(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (n, notifications) => {
          const items = notifications.slice(0, n);
          while (items.length < n) {
            items.push({ type: 'info', message: `msg-${items.length}` });
          }

          const { result } = renderHook(() => useNotificationContext(), { wrapper });

          act(() => {
            for (const item of items) {
              result.current.addNotification({
                type: item.type as 'success' | 'error' | 'warning' | 'info',
                message: item.message,
                autoDismiss: false,
              });
            }
          });

          expect(result.current.notifications.length).toBe(n);
        }
      ),
      { numRuns: 100 }
    );
  });
});
