import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, computeTotalPages } from './utils';

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-03-15');
    expect(result).toBe('15 Mar 2024');
  });

  it('formats another valid date', () => {
    const result = formatDate('2023-12-01');
    expect(result).toBe('01 Dec 2023');
  });

  it('returns the original string for an invalid date', () => {
    const result = formatDate('not-a-date');
    expect(result).toBe('not-a-date');
  });

  it('returns the original string for an empty string', () => {
    const result = formatDate('');
    expect(result).toBe('');
  });
});

describe('formatDateTime', () => {
  it('formats a valid ISO datetime string', () => {
    const result = formatDateTime('2024-03-15T14:30:00Z');
    // The exact output depends on locale/timezone, but should contain date parts
    expect(result).toContain('15');
    expect(result).toContain('Mar');
    expect(result).toContain('2024');
  });

  it('returns the original string for an invalid datetime', () => {
    const result = formatDateTime('invalid');
    expect(result).toBe('invalid');
  });
});

describe('computeTotalPages', () => {
  it('returns 1 when total is 0', () => {
    expect(computeTotalPages(0, 10)).toBe(1);
  });

  it('returns 1 when items fit in one page', () => {
    expect(computeTotalPages(5, 10)).toBe(1);
  });

  it('returns correct pages when items divide evenly', () => {
    expect(computeTotalPages(20, 10)).toBe(2);
  });

  it('rounds up when items do not divide evenly', () => {
    expect(computeTotalPages(21, 10)).toBe(3);
  });

  it('returns 1 for pageSize <= 0', () => {
    expect(computeTotalPages(10, 0)).toBe(1);
    expect(computeTotalPages(10, -5)).toBe(1);
  });

  it('handles large totals', () => {
    expect(computeTotalPages(1000, 25)).toBe(40);
    expect(computeTotalPages(1001, 25)).toBe(41);
  });
});
