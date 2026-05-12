import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createUserSchema } from '../user.validator';
import { travelFormSchema } from '../travel.validator';
import { createRoleSchema } from '../role.validator';
import { cityFormSchema } from '../city.validator';

/**
 * Property 4: String length validation
 * Validates: Requirements 5.4, 8.3, 9.3, 10.5
 *
 * For any string input and a validation schema with min/max length constraints,
 * the validator SHALL accept strings whose length is within [min, max] inclusive
 * and reject strings whose length is outside that range.
 */
describe('Feature: perdin-dashboard, Property 4: String length validation', () => {
  describe('createUserSchema.name (2-100)', () => {
    it('accepts strings within valid range [2, 100]', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 100 }),
          (name) => {
            const result = createUserSchema.shape.name.safeParse(name);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than min length (< 2)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 1 }),
          (name) => {
            const result = createUserSchema.shape.name.safeParse(name);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings longer than max length (> 100)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 101, maxLength: 200 }),
          (name) => {
            const result = createUserSchema.shape.name.safeParse(name);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('travelFormSchema.purpose (5-255)', () => {
    const purposeSchema = travelFormSchema.def.shape.purpose;

    it('accepts strings within valid range [5, 255]', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 255 }),
          (purpose) => {
            const result = purposeSchema.safeParse(purpose);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than min length (< 5)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 4 }),
          (purpose) => {
            const result = purposeSchema.safeParse(purpose);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings longer than max length (> 255)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 256, maxLength: 400 }),
          (purpose) => {
            const result = purposeSchema.safeParse(purpose);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('createRoleSchema.name (2-50)', () => {
    it('accepts strings within valid range [2, 50]', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }),
          (name) => {
            const result = createRoleSchema.shape.name.safeParse(name);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than min length (< 2)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 1 }),
          (name) => {
            const result = createRoleSchema.shape.name.safeParse(name);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings longer than max length (> 50)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 150 }),
          (name) => {
            const result = createRoleSchema.shape.name.safeParse(name);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('cityFormSchema.name (2-100)', () => {
    it('accepts strings within valid range [2, 100]', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 100 }),
          (name) => {
            const result = cityFormSchema.shape.name.safeParse(name);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than min length (< 2)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 1 }),
          (name) => {
            const result = cityFormSchema.shape.name.safeParse(name);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings longer than max length (> 100)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 101, maxLength: 200 }),
          (name) => {
            const result = cityFormSchema.shape.name.safeParse(name);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
