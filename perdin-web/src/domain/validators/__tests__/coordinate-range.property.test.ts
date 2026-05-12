import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { cityFormSchema } from '../city.validator';

/**
 * Property 7: Coordinate range validation
 * Validates: Requirements 10.3, 10.4
 *
 * For any numeric input, the latitude validator SHALL accept values in [-90, 90]
 * and reject values outside that range, and the longitude validator SHALL accept
 * values in [-180, 180] and reject values outside that range.
 */
describe('Feature: perdin-dashboard, Property 7: Coordinate range validation', () => {
  const validCityBase = {
    name: 'Jakarta',
    province: 'DKI Jakarta',
    island: 'Jawa',
    isOverseas: false,
  };

  describe('Latitude validation [-90, 90]', () => {
    it('accepts latitude values within [-90, 90]', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -90, max: 90, noNaN: true }),
          (latitude) => {
            const result = cityFormSchema.safeParse({
              ...validCityBase,
              latitude,
              longitude: 0,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects latitude values below -90', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: -90, noNaN: true }).filter((v) => v < -90),
          (latitude) => {
            const result = cityFormSchema.safeParse({
              ...validCityBase,
              latitude,
              longitude: 0,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects latitude values above 90', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 90, max: 1000, noNaN: true }).filter((v) => v > 90),
          (latitude) => {
            const result = cityFormSchema.safeParse({
              ...validCityBase,
              latitude,
              longitude: 0,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Longitude validation [-180, 180]', () => {
    it('accepts longitude values within [-180, 180]', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -180, max: 180, noNaN: true }),
          (longitude) => {
            const result = cityFormSchema.safeParse({
              ...validCityBase,
              latitude: 0,
              longitude,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects longitude values below -180', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: -180, noNaN: true }).filter((v) => v < -180),
          (longitude) => {
            const result = cityFormSchema.safeParse({
              ...validCityBase,
              latitude: 0,
              longitude,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects longitude values above 180', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 180, max: 1000, noNaN: true }).filter((v) => v > 180),
          (longitude) => {
            const result = cityFormSchema.safeParse({
              ...validCityBase,
              latitude: 0,
              longitude,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
