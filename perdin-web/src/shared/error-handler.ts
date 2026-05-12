/**
 * Centralized error handler using a global event bus pattern.
 * This allows the Axios interceptor (which runs outside React context)
 * to emit error events that React components can subscribe to.
 */

export interface ApiErrorEvent {
  type: 'api-error';
  status: number | null; // null for network errors
  message: string;
  persistent: boolean;
  originalError?: unknown;
}

export type ErrorEventListener = (event: ApiErrorEvent) => void;

const listeners: Set<ErrorEventListener> = new Set();

/**
 * Subscribe to API error events.
 * Returns an unsubscribe function.
 */
export function onApiError(listener: ErrorEventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Emit an API error event to all subscribers.
 */
export function emitApiError(event: ApiErrorEvent): void {
  listeners.forEach((listener) => listener(event));
}

/**
 * Maps HTTP status codes to user-friendly error notifications.
 * Called from the Axios response interceptor.
 */
export function handleApiError(error: unknown): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axiosError = error as any;

  // Network error (no response from server)
  if (!axiosError?.response) {
    emitApiError({
      type: 'api-error',
      status: null,
      message: 'Connection problem. Please check your network and try again.',
      persistent: true,
      originalError: error,
    });
    return;
  }

  const status = axiosError.response.status;
  const url: string = axiosError.config?.url ?? '';

  // 401 on the login endpoint = wrong credentials — let the form handle it inline
  if (status === 401 && url.includes('/auth/login')) {
    return;
  }

  switch (status) {
    case 403:
      emitApiError({
        type: 'api-error',
        status: 403,
        message: 'Insufficient permissions to perform this action.',
        persistent: false,
        originalError: error,
      });
      break;

    case 404:
      emitApiError({
        type: 'api-error',
        status: 404,
        message: 'The requested resource was not found.',
        persistent: false,
        originalError: error,
      });
      break;

    case 500:
      console.error('Server error (500):', axiosError.response.data ?? error);
      emitApiError({
        type: 'api-error',
        status: 500,
        message: 'An unexpected server error occurred. Please try again later.',
        persistent: false,
        originalError: error,
      });
      break;

    case 400:
      // Only emit for non-form contexts (form errors are handled inline)
      // The interceptor emits this; form hooks can suppress it by handling errors themselves
      emitApiError({
        type: 'api-error',
        status: 400,
        message: 'The request was invalid. Please check your input and try again.',
        persistent: false,
        originalError: error,
      });
      break;

    default:
      // For other error statuses not explicitly handled, emit a generic error
      if (status >= 400) {
        emitApiError({
          type: 'api-error',
          status,
          message: 'An error occurred. Please try again.',
          persistent: false,
          originalError: error,
        });
      }
      break;
  }
}
