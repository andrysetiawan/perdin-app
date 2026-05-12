import { useEffect } from 'react';

import { onApiError, type ApiErrorEvent } from '@/shared/error-handler';
import { useNotificationContext } from '@/presentation/context/NotificationContext';

/**
 * Hook that subscribes to the global API error event bus and
 * routes error events into the notification system.
 *
 * Should be mounted once at the app root level (e.g., in RootLayout or providers).
 */
export function useApiErrorHandler(): void {
  const { addNotification } = useNotificationContext();

  useEffect(() => {
    const unsubscribe = onApiError((event: ApiErrorEvent) => {
      addNotification({
        type: 'error',
        message: event.message,
        autoDismiss: !event.persistent,
      });
    });

    return unsubscribe;
  }, [addNotification]);
}
