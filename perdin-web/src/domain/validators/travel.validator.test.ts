import { describe, it, expect } from 'vitest';
import { travelFormSchema } from './travel.validator';

const validTravel = {
  purpose: 'Business meeting in Jakarta',
  originCityId: '550e8400-e29b-41d4-a716-446655440000',
  destinationCityId: '550e8400-e29b-41d4-a716-446655440001',
  startDate: '2024-06-01',
  endDate: '2024-06-03',
};

describe('travelFormSchema', () => {
  it('accepts valid travel form data', () => {
    const result = travelFormSchema.safeParse(validTravel);
    expect(result.success).toBe(true);
  });

  it('rejects purpose shorter than 5 characters', () => {
    const result = travelFormSchema.safeParse({ ...validTravel, purpose: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('rejects purpose longer than 255 characters', () => {
    const result = travelFormSchema.safeParse({
      ...validTravel,
      purpose: 'a'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID for originCityId', () => {
    const result = travelFormSchema.safeParse({
      ...validTravel,
      originCityId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = travelFormSchema.safeParse({
      ...validTravel,
      startDate: '06/01/2024',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when origin and destination are the same', () => {
    const result = travelFormSchema.safeParse({
      ...validTravel,
      destinationCityId: validTravel.originCityId,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('destinationCityId'));
      expect(issue?.message).toBe('Origin and destination must be different');
    }
  });

  it('rejects when end date is before start date', () => {
    const result = travelFormSchema.safeParse({
      ...validTravel,
      startDate: '2024-06-05',
      endDate: '2024-06-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('endDate'));
      expect(issue?.message).toBe('End date must be on or after start date');
    }
  });

  it('accepts when end date equals start date', () => {
    const result = travelFormSchema.safeParse({
      ...validTravel,
      startDate: '2024-06-01',
      endDate: '2024-06-01',
    });
    expect(result.success).toBe(true);
  });
});
