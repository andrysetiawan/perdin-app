import { describe, it, expect } from 'vitest';
import { loginSchema } from './auth.validator';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects email longer than 254 characters', () => {
    const result = loginSchema.safeParse({
      email: 'a'.repeat(246) + '@test.com',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password longer than 72 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(73),
    });
    expect(result.success).toBe(false);
  });

  it('accepts password at boundary lengths (6 and 72)', () => {
    expect(
      loginSchema.safeParse({ email: 'u@e.co', password: '123456' }).success
    ).toBe(true);
    expect(
      loginSchema.safeParse({ email: 'u@e.co', password: 'a'.repeat(72) }).success
    ).toBe(true);
  });
});
