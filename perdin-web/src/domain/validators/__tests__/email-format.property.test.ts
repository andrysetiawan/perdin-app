import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { loginSchema } from '../auth.validator';
import { createUserSchema } from '../user.validator';

/**
 * Feature: perdin-dashboard, Property 5: Email format validation
 *
 * Validates: Requirements 1.9, 8.4
 *
 * For any string input, the email validator SHALL accept strings that conform
 * to a valid email format (contains exactly one `@`, has a non-empty local part
 * and a domain with at least one dot) and reject strings that do not conform.
 */

/**
 * Generates valid email addresses in the format localpart@domain.tld
 * that conform to Zod's email validation (alphanumeric local parts with dots).
 */
const validEmailArbitrary = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9.]{0,19}$/).filter(
      (s) => s.length >= 1 && !s.startsWith('.') && !s.endsWith('.') && !s.includes('..')
    ),
    fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/).filter((s) => s.length >= 1),
    fc.stringMatching(/^[a-z]{2,6}$/)
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

describe('Feature: perdin-dashboard, Property 5: Email format validation', () => {
  const validPassword = 'validPass123';
  const validName = 'Test User';

  describe('loginSchema email validation', () => {
    it('valid email format strings (generated as localpart@domain.tld) are accepted', () => {
      fc.assert(
        fc.property(validEmailArbitrary, (email) => {
          const result = loginSchema.safeParse({ email, password: validPassword });
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('strings without @ are rejected', () => {
      const noAtArbitrary = fc.string({ minLength: 1 }).filter((s) => !s.includes('@'));

      fc.assert(
        fc.property(noAtArbitrary, (email) => {
          const result = loginSchema.safeParse({ email, password: validPassword });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('strings with empty local part (starting with @) are rejected', () => {
      const emptyLocalPartArbitrary = fc
        .string({ minLength: 1 })
        .map((domain) => `@${domain}`);

      fc.assert(
        fc.property(emptyLocalPartArbitrary, (email) => {
          const result = loginSchema.safeParse({ email, password: validPassword });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('strings with domain missing a dot are rejected', () => {
      const noDotDomainArbitrary = fc
        .tuple(
          fc.string({ minLength: 1, unit: 'grapheme' }).filter((s) => !s.includes('@') && !s.includes('.')),
          fc.string({ minLength: 1, unit: 'grapheme' }).filter((s) => !s.includes('@') && !s.includes('.'))
        )
        .map(([local, domain]) => `${local}@${domain}`);

      fc.assert(
        fc.property(noDotDomainArbitrary, (email) => {
          const result = loginSchema.safeParse({ email, password: validPassword });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('createUserSchema email validation', () => {
    it('valid email format strings (generated as localpart@domain.tld) are accepted', () => {
      fc.assert(
        fc.property(validEmailArbitrary, (email) => {
          const result = createUserSchema.safeParse({
            name: validName,
            email,
            password: validPassword,
          });
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('strings without @ are rejected', () => {
      const noAtArbitrary = fc.string({ minLength: 1 }).filter((s) => !s.includes('@'));

      fc.assert(
        fc.property(noAtArbitrary, (email) => {
          const result = createUserSchema.safeParse({
            name: validName,
            email,
            password: validPassword,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('strings with empty local part (starting with @) are rejected', () => {
      const emptyLocalPartArbitrary = fc
        .string({ minLength: 1 })
        .map((domain) => `@${domain}`);

      fc.assert(
        fc.property(emptyLocalPartArbitrary, (email) => {
          const result = createUserSchema.safeParse({
            name: validName,
            email,
            password: validPassword,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('strings with domain missing a dot are rejected', () => {
      const noDotDomainArbitrary = fc
        .tuple(
          fc.string({ minLength: 1, unit: 'grapheme' }).filter((s) => !s.includes('@') && !s.includes('.')),
          fc.string({ minLength: 1, unit: 'grapheme' }).filter((s) => !s.includes('@') && !s.includes('.'))
        )
        .map(([local, domain]) => `${local}@${domain}`);

      fc.assert(
        fc.property(noDotDomainArbitrary, (email) => {
          const result = createUserSchema.safeParse({
            name: validName,
            email,
            password: validPassword,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});
