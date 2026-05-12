import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { onApiError, emitApiError, handleApiError, type ApiErrorEvent, type ErrorEventListener } from './error-handler';

describe('error-handler', () => {
  describe('event bus (onApiError / emitApiError)', () => {
    it('notifies subscribers when an error event is emitted', () => {
      const listener = vi.fn();
      const unsubscribe = onApiError(listener);

      const event: ApiErrorEvent = {
        type: 'api-error',
        status: 500,
        message: 'Server error',
        persistent: false,
      };

      emitApiError(event);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(event);

      unsubscribe();
    });

    it('stops notifying after unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = onApiError(listener);

      unsubscribe();

      emitApiError({
        type: 'api-error',
        status: 404,
        message: 'Not found',
        persistent: false,
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it('notifies multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsub1 = onApiError(listener1);
      const unsub2 = onApiError(listener2);

      emitApiError({
        type: 'api-error',
        status: 403,
        message: 'Forbidden',
        persistent: false,
      });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();
    });
  });

  describe('handleApiError', () => {
    let listener: ReturnType<typeof vi.fn<ErrorEventListener>>;
    let unsubscribe: () => void;

    beforeEach(() => {
      listener = vi.fn<ErrorEventListener>();
      unsubscribe = onApiError(listener);
    });

    afterEach(() => {
      unsubscribe();
    });

    it('emits a persistent network error when no response exists', () => {
      handleApiError({ message: 'Network Error' });

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as ApiErrorEvent;
      expect(event.status).toBeNull();
      expect(event.persistent).toBe(true);
      expect(event.message).toContain('Connection problem');
    });

    it('emits a 403 error with insufficient permissions message', () => {
      handleApiError({ response: { status: 403 } });

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as ApiErrorEvent;
      expect(event.status).toBe(403);
      expect(event.persistent).toBe(false);
      expect(event.message).toContain('Insufficient permissions');
    });

    it('emits a 404 error with resource not found message', () => {
      handleApiError({ response: { status: 404 } });

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as ApiErrorEvent;
      expect(event.status).toBe(404);
      expect(event.persistent).toBe(false);
      expect(event.message).toContain('not found');
    });

    it('emits a 500 error and logs to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      handleApiError({ response: { status: 500, data: { message: 'Internal error' } } });

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as ApiErrorEvent;
      expect(event.status).toBe(500);
      expect(event.persistent).toBe(false);
      expect(event.message).toContain('unexpected server error');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('emits a 400 error with invalid request message', () => {
      handleApiError({ response: { status: 400 } });

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as ApiErrorEvent;
      expect(event.status).toBe(400);
      expect(event.persistent).toBe(false);
      expect(event.message).toContain('invalid');
    });

    it('emits a generic error for other 4xx/5xx statuses', () => {
      handleApiError({ response: { status: 422 } });

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as ApiErrorEvent;
      expect(event.status).toBe(422);
      expect(event.message).toContain('error occurred');
    });
  });
});
