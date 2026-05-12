import { describe, it, expect } from 'vitest';
import { createRoleSchema } from './role.validator';

describe('createRoleSchema', () => {
  it('accepts valid role name', () => {
    const result = createRoleSchema.safeParse({ name: 'admin' });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = createRoleSchema.safeParse({ name: 'a' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 50 characters', () => {
    const result = createRoleSchema.safeParse({ name: 'a'.repeat(51) });
    expect(result.success).toBe(false);
  });

  it('accepts name at boundary lengths (2 and 50)', () => {
    expect(createRoleSchema.safeParse({ name: 'ab' }).success).toBe(true);
    expect(createRoleSchema.safeParse({ name: 'a'.repeat(50) }).success).toBe(true);
  });
});
