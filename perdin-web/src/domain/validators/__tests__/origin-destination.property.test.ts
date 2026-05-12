import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { travelFormSchema } from '../travel.validator';

/**
 * Feature: perdin-dashboard, Property 9: Travel origin-destination distinctness
 * Validates: Requirements 5.6
 *
 * For any pair of city IDs (originCityId, destinationCityId), the travel form validator
 * SHALL reject the pair if originCityId equals destinationCityId and accept the pair
 * if they are different (assuming other fields are valid).
 */
describe('Feature: perdin-dashboard, Property 9: Travel origin-destination distinctness', () => {
  // Helper to build a valid travel form with given city IDs
  const buildValidForm = (originCityId: string, destinationCityId: string) => ({
    purpose: 'Valid business travel purpose',
    originCityId,
    destinationCityId,
    startDate: '2024-06-01',
    endDate: '2024-06-03',
  });

  it('rejects form when originCityId equals destinationCityId', () => {
    fc.assert(
      fc.property(fc.uuid(), (cityId) => {
        const form = buildValidForm(cityId, cityId);
        const result = travelFormSchema.safeParse(form);

        expect(result.success).toBe(false);
        if (!result.success) {
          const issue = result.error.issues.find((i) =>
            i.path.includes('destinationCityId')
          );
          expect(issue).toBeDefined();
          expect(issue?.message).toBe('Origin and destination must be different');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('accepts form when originCityId differs from destinationCityId', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        (originCityId, destinationCityId) => {
          // Only test when the two UUIDs are actually different
          fc.pre(originCityId !== destinationCityId);

          const form = buildValidForm(originCityId, destinationCityId);
          const result = travelFormSchema.safeParse(form);

          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
