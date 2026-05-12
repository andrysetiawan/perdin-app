import { describe, it, expect } from 'vitest';
import { cityFormSchema } from './city.validator';

const validCity = {
  name: 'Jakarta',
  latitude: -6.2,
  longitude: 106.8,
  province: 'DKI Jakarta',
  island: 'Jawa',
  isOverseas: false,
};

describe('cityFormSchema', () => {
  it('accepts valid city data', () => {
    const result = cityFormSchema.safeParse(validCity);
    expect(result.success).toBe(true);
  });

  it('defaults isOverseas to false when not provided', () => {
    const { isOverseas, ...withoutOverseas } = validCity;
    const result = cityFormSchema.safeParse(withoutOverseas);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isOverseas).toBe(false);
    }
  });

  it('rejects name shorter than 2 characters', () => {
    const result = cityFormSchema.safeParse({ ...validCity, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 100 characters', () => {
    const result = cityFormSchema.safeParse({ ...validCity, name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects latitude below -90', () => {
    const result = cityFormSchema.safeParse({ ...validCity, latitude: -91 });
    expect(result.success).toBe(false);
  });

  it('rejects latitude above 90', () => {
    const result = cityFormSchema.safeParse({ ...validCity, latitude: 91 });
    expect(result.success).toBe(false);
  });

  it('rejects longitude below -180', () => {
    const result = cityFormSchema.safeParse({ ...validCity, longitude: -181 });
    expect(result.success).toBe(false);
  });

  it('rejects longitude above 180', () => {
    const result = cityFormSchema.safeParse({ ...validCity, longitude: 181 });
    expect(result.success).toBe(false);
  });

  it('accepts boundary latitude values (-90 and 90)', () => {
    expect(cityFormSchema.safeParse({ ...validCity, latitude: -90 }).success).toBe(true);
    expect(cityFormSchema.safeParse({ ...validCity, latitude: 90 }).success).toBe(true);
  });

  it('accepts boundary longitude values (-180 and 180)', () => {
    expect(cityFormSchema.safeParse({ ...validCity, longitude: -180 }).success).toBe(true);
    expect(cityFormSchema.safeParse({ ...validCity, longitude: 180 }).success).toBe(true);
  });

  it('rejects empty province', () => {
    const result = cityFormSchema.safeParse({ ...validCity, province: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty island', () => {
    const result = cityFormSchema.safeParse({ ...validCity, island: '' });
    expect(result.success).toBe(false);
  });
});
