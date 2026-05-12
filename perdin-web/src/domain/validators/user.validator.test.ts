import { describe, it, expect } from 'vitest';
import { createUserSchema } from './user.validator';

describe('createUserSchema', () => {
  it('accepts valid user data', () => {
    const result = createUserSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = createUserSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = createUserSchema.safeParse({
      name: 'a'.repeat(101),
      email: 'john@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({
      name: 'John',
      email: 'not-email',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 characters', () => {
    const result = createUserSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password longer than 72 characters', () => {
    const result = createUserSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: 'a'.repeat(73),
    });
    expect(result.success).toBe(false);
  });
});
