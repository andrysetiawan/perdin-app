import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { travelFormSchema } from '../travel.validator';

/**
 * Feature: perdin-dashboard, Property 8: Travel date ordering validation
 * Validates: Requirements 5.5
 *
 * For any pair of dates (startDate, endDate), the travel form validator SHALL accept
 * the pair if endDate >= startDate and reject the pair if endDate < startDate.
 */

const VALID_PURPOSE = 'Business trip to client office';
const ORIGIN_CITY_ID = '550e8400-e29b-41d4-a716-446655440000';
const DESTINATION_CITY_ID = '550e8400-e29b-41d4-a716-446655440001';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Use integer-based date generation to avoid NaN dates from fc.date() shrinking
const validDateArb = fc
  .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
  .filter((d) => !isNaN(d.getTime()));

describe('Feature: perdin-dashboard, Property 8: Travel date ordering validation', () => {
  it('accepts when endDate >= startDate', () => {
    fc.assert(
      fc.property(
        validDateArb,
        fc.nat({ max: 365 }),
        (startDate, daysToAdd) => {
          const endDate = new Date(startDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

          const result = travelFormSchema.safeParse({
            purpose: VALID_PURPOSE,
            originCityId: ORIGIN_CITY_ID,
            destinationCityId: DESTINATION_CITY_ID,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
          });

          expect(result.success).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('rejects when endDate < startDate', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-02'), max: new Date('2099-12-31') }).filter((d) => !isNaN(d.getTime())),
        fc.integer({ min: 1, max: 365 }),
        (startDate, daysToSubtract) => {
          const endDate = new Date(startDate.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);

          const result = travelFormSchema.safeParse({
            purpose: VALID_PURPOSE,
            originCityId: ORIGIN_CITY_ID,
            destinationCityId: DESTINATION_CITY_ID,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
          });

          expect(result.success).toBe(false);
          if (!result.success) {
            const endDateIssue = result.error.issues.find((i) =>
              i.path.includes('endDate'),
            );
            expect(endDateIssue).toBeDefined();
            expect(endDateIssue?.message).toBe(
              'End date must be on or after start date',
            );
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
