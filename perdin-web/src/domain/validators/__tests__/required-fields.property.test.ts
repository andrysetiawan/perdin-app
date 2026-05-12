import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { travelFormSchema } from '../travel.validator';

/**
 * Feature: perdin-dashboard, Property 10: Required field completeness validation
 * Validates: Requirements 5.7
 *
 * For any travel form state where at least one required field (purpose, originCityId,
 * destinationCityId, startDate, endDate) is empty or missing, the form SHALL be invalid
 * and submission SHALL be disabled.
 */
describe('Feature: perdin-dashboard, Property 10: Required field completeness validation', () => {
  const requiredFields = [
    'purpose',
    'originCityId',
    'destinationCityId',
    'startDate',
    'endDate',
  ] as const;

  // Generate a valid base form with distinct origin and destination
  const validBaseForm = () => ({
    purpose: 'Valid business travel purpose',
    originCityId: '550e8400-e29b-41d4-a716-446655440000',
    destinationCityId: '550e8400-e29b-41d4-a716-446655440001',
    startDate: '2024-06-01',
    endDate: '2024-06-03',
  });

  it('accepts form when all required fields are provided with valid values', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 5, max: 50 }),
        fc.integer({ min: 2024, max: 2030 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
        fc.integer({ min: 0, max: 10 }),
        (originId, destId, purposeLen, year, month, day, durationDays) => {
          // Ensure origin and destination are different
          fc.pre(originId !== destId);

          const purpose = 'A'.repeat(purposeLen);
          const startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const endDay = Math.min(day + durationDays, 28);
          const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

          const form = {
            purpose,
            originCityId: originId,
            destinationCityId: destId,
            startDate,
            endDate,
          };

          const result = travelFormSchema.safeParse(form);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects form when any single required field is empty string', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredFields),
        (fieldToEmpty) => {
          const form: Record<string, string> = { ...validBaseForm() };
          form[fieldToEmpty] = '';

          const result = travelFormSchema.safeParse(form);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects form when any single required field is missing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredFields),
        (fieldToRemove) => {
          const form: Record<string, string> = { ...validBaseForm() };
          delete form[fieldToRemove];

          const result = travelFormSchema.safeParse(form);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects form when multiple required fields are empty or missing', () => {
    fc.assert(
      fc.property(
        fc.subarray([...requiredFields], { minLength: 2 }),
        fc.constantFrom('empty', 'missing'),
        (fieldsToInvalidate, invalidationType) => {
          const form: Record<string, string> = { ...validBaseForm() };

          for (const field of fieldsToInvalidate) {
            if (invalidationType === 'empty') {
              form[field] = '';
            } else {
              delete form[field];
            }
          }

          const result = travelFormSchema.safeParse(form);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
