import { useApiErrorHandler } from '@/presentation/hooks/useApiErrorHandler';

/**
 * Invisible component that subscribes to the global API error event bus
 * and routes errors into the notification system.
 *
 * Must be rendered inside NotificationProvider.
 */
export function ApiErrorListener(): null {
  useApiErrorHandler();
  return null;
}
