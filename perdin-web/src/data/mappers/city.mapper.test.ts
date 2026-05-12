import { describe, it, expect } from 'vitest';
import {
  mapCityResponseToEntity,
  mapCityListResponse,
  type CityResponse,
} from './city.mapper';

describe('mapCityResponseToEntity', () => {
  it('maps a CityResponse to a City entity with snake_case to camelCase conversion', () => {
    const response: CityResponse = {
      id: 'city-1',
      name: 'Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      province: 'DKI Jakarta',
      island: 'Jawa',
      is_overseas: false,
    };

    const result = mapCityResponseToEntity(response);

    expect(result).toEqual({
      id: 'city-1',
      name: 'Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      province: 'DKI Jakarta',
      island: 'Jawa',
      isOverseas: false,
    });
  });

  it('maps is_overseas true to isOverseas true', () => {
    const response: CityResponse = {
      id: 'city-2',
      name: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      province: 'Overseas',
      island: 'Overseas',
      is_overseas: true,
    };

    const result = mapCityResponseToEntity(response);

    expect(result.isOverseas).toBe(true);
  });
});

describe('mapCityListResponse', () => {
  it('maps an array of CityResponse to City entities', () => {
    const responses: CityResponse[] = [
      {
        id: 'city-1',
        name: 'Jakarta',
        latitude: -6.2088,
        longitude: 106.8456,
        province: 'DKI Jakarta',
        island: 'Jawa',
        is_overseas: false,
      },
      {
        id: 'city-2',
        name: 'Surabaya',
        latitude: -7.2575,
        longitude: 112.7521,
        province: 'Jawa Timur',
        island: 'Jawa',
        is_overseas: false,
      },
    ];

    const result = mapCityListResponse(responses);

    expect(result).toHaveLength(2);
    expect(result[0].isOverseas).toBe(false);
    expect(result[1].name).toBe('Surabaya');
  });

  it('returns an empty array for empty input', () => {
    const result = mapCityListResponse([]);
    expect(result).toEqual([]);
  });
});
