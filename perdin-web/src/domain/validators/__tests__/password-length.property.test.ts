import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { loginSchema } from '../auth.validator';
import { createUserSchema } from '../user.validator';
import { changePasswordSchema } from '../password.validator';

/**
 * Property 6: Password length validation
 * Validates: Requirements 1.9, 8.5, 11.3, 11.4
 *
 * For any string input, the password validator SHALL accept strings with length
 * between 6 and 72 characters inclusive, and reject strings shorter than 6 or
 * longer than 72 characters.
 */
describe('Feature: perdin-dashboard, Property 6: Password length validation', () => {
  describe('loginSchema.password (min 6, max 72)', () => {
    it('accepts strings with length 6-72', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 6, maxLength: 72 }),
          (password) => {
            const result = loginSchema.shape.password.safeParse(password);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than 6', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 5 }),
          (password) => {
            const result = loginSchema.shape.password.safeParse(password);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings longer than 72', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 73, maxLength: 200 }),
          (password) => {
            const result = loginSchema.shape.password.safeParse(password);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('createUserSchema.password (min 6, max 72)', () => {
    it('accepts strings with length 6-72', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 6, maxLength: 72 }),
          (password) => {
            const result = createUserSchema.shape.password.safeParse(password);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than 6', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 5 }),
          (password) => {
            const result = createUserSchema.shape.password.safeParse(password);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings longer than 72', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 73, maxLength: 200 }),
          (password) => {
            const result = createUserSchema.shape.password.safeParse(password);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('changePasswordSchema.newPassword (min 6, max 72)', () => {
    it('accepts strings with length 6-72', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 6, maxLength: 72 }),
          (password) => {
            const result = changePasswordSchema.shape.newPassword.safeParse(password);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than 6', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 5 }),
          (password) => {
            const result = changePasswordSchema.shape.newPassword.safeParse(password);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings longer than 72', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 73, maxLength: 200 }),
          (password) => {
            const result = changePasswordSchema.shape.newPassword.safeParse(password);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('changePasswordSchema.oldPassword (min 6, no explicit max)', () => {
    it('accepts strings with length >= 6', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 6, maxLength: 200 }),
          (password) => {
            const result = changePasswordSchema.shape.oldPassword.safeParse(password);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects strings shorter than 6', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 5 }),
          (password) => {
            const result = changePasswordSchema.shape.oldPassword.safeParse(password);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
