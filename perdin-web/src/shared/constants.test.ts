import { describe, it, expect } from 'vitest';
import {
  API_BASE_URL,
  PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  MAX_NOTIFICATIONS,
  NOTIFICATION_AUTO_DISMISS_MS,
} from './constants';

describe('constants', () => {
  it('API_BASE_URL points to localhost API', () => {
    expect(API_BASE_URL).toBe('http://localhost:8080/api/v1');
  });

  it('PAGE_SIZE_OPTIONS contains expected values', () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([10, 25, 50]);
  });

  it('DEFAULT_PAGE_SIZE is 10', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(10);
  });

  it('MAX_NOTIFICATIONS is 5', () => {
    expect(MAX_NOTIFICATIONS).toBe(5);
  });

  it('NOTIFICATION_AUTO_DISMISS_MS is 5000', () => {
    expect(NOTIFICATION_AUTO_DISMISS_MS).toBe(5000);
  });
});
