import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeTotalPages } from '../utils';

/**
 * Property 11: Pagination total pages computation
 * Validates: Requirements 4.4
 *
 * For any total item count (≥ 0) and page size (> 0), the computed total pages
 * SHALL equal Math.ceil(total / pageSize), with a minimum of 1 page when total is 0.
 */
describe('Feature: perdin-dashboard, Property 11: Pagination total pages computation', () => {
  it('for any total > 0 and pageSize > 0, result equals Math.ceil(total / pageSize)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.integer({ min: 1, max: 1000 }),
        (total, pageSize) => {
          const result = computeTotalPages(total, pageSize);
          expect(result).toBe(Math.ceil(total / pageSize));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when total is 0, result is always 1 (minimum 1 page)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (pageSize) => {
          const result = computeTotalPages(0, pageSize);
          expect(result).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('result is always >= 1', () => {
    fc.assert(
      fc.property(
        fc.nat(),
        fc.integer({ min: 1, max: 1000 }),
        (total, pageSize) => {
          const result = computeTotalPages(total, pageSize);
          expect(result).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('result * pageSize >= total (enough pages to hold all items)', () => {
    fc.assert(
      fc.property(
        fc.nat(),
        fc.integer({ min: 1, max: 1000 }),
        (total, pageSize) => {
          const result = computeTotalPages(total, pageSize);
          expect(result * pageSize).toBeGreaterThanOrEqual(total);
        }
      ),
      { numRuns: 100 }
    );
  });
});
