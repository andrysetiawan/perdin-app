import { describe, it, expect } from 'vitest';
import { changePasswordSchema } from './password.validator';

describe('changePasswordSchema', () => {
  it('accepts valid password change data', () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: 'oldpass123',
      newPassword: 'newpass456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects old password shorter than 6 characters', () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: '12345',
      newPassword: 'newpass456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects new password shorter than 6 characters', () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: 'oldpass123',
      newPassword: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects new password longer than 72 characters', () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: 'oldpass123',
      newPassword: 'a'.repeat(73),
    });
    expect(result.success).toBe(false);
  });

  it('accepts boundary lengths for new password (6 and 72)', () => {
    expect(
      changePasswordSchema.safeParse({ oldPassword: '123456', newPassword: '123456' }).success
    ).toBe(true);
    expect(
      changePasswordSchema.safeParse({ oldPassword: '123456', newPassword: 'a'.repeat(72) }).success
    ).toBe(true);
  });
});
