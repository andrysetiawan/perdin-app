import { describe, it, expect } from 'vitest';
import {
  mapTravelResponseToEntity,
  mapTravelListResponse,
  type TravelResponse,
} from './travel.mapper';

describe('mapTravelResponseToEntity', () => {
  it('maps a TravelResponse to a Travel entity with snake_case to camelCase conversion', () => {
    const response: TravelResponse = {
      id: 'travel-1',
      user_id: 'user-1',
      purpose: 'Business meeting',
      origin_city_id: 'city-1',
      destination_city_id: 'city-2',
      start_date: '2024-03-01',
      end_date: '2024-03-03',
      duration_days: 3,
      distance_km: 750,
      allowance_per_day: 500000,
      total_allowance: 1500000,
      status: 'pending',
      approved_by: null,
      approved_at: null,
    };

    const result = mapTravelResponseToEntity(response);

    expect(result).toEqual({
      id: 'travel-1',
      userId: 'user-1',
      purpose: 'Business meeting',
      originCityId: 'city-1',
      destinationCityId: 'city-2',
      startDate: '2024-03-01',
      endDate: '2024-03-03',
      durationDays: 3,
      distanceKm: 750,
      allowancePerDay: 500000,
      totalAllowance: 1500000,
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
    });
  });

  it('maps approved travel with approved_by and approved_at fields', () => {
    const response: TravelResponse = {
      id: 'travel-2',
      user_id: 'user-2',
      purpose: 'Conference attendance',
      origin_city_id: 'city-3',
      destination_city_id: 'city-4',
      start_date: '2024-04-10',
      end_date: '2024-04-12',
      duration_days: 3,
      distance_km: 1200,
      allowance_per_day: 600000,
      total_allowance: 1800000,
      status: 'approved',
      approved_by: 'admin-1',
      approved_at: '2024-03-25T10:00:00Z',
    };

    const result = mapTravelResponseToEntity(response);

    expect(result.userId).toBe('user-2');
    expect(result.originCityId).toBe('city-3');
    expect(result.destinationCityId).toBe('city-4');
    expect(result.startDate).toBe('2024-04-10');
    expect(result.endDate).toBe('2024-04-12');
    expect(result.durationDays).toBe(3);
    expect(result.distanceKm).toBe(1200);
    expect(result.allowancePerDay).toBe(600000);
    expect(result.totalAllowance).toBe(1800000);
    expect(result.status).toBe('approved');
    expect(result.approvedBy).toBe('admin-1');
    expect(result.approvedAt).toBe('2024-03-25T10:00:00Z');
  });

  it('maps rejected travel status correctly', () => {
    const response: TravelResponse = {
      id: 'travel-3',
      user_id: 'user-3',
      purpose: 'Site visit',
      origin_city_id: 'city-1',
      destination_city_id: 'city-5',
      start_date: '2024-05-01',
      end_date: '2024-05-02',
      duration_days: 2,
      distance_km: 300,
      allowance_per_day: 400000,
      total_allowance: 800000,
      status: 'rejected',
      approved_by: 'hr-1',
      approved_at: '2024-04-28T14:30:00Z',
    };

    const result = mapTravelResponseToEntity(response);

    expect(result.status).toBe('rejected');
  });
});

describe('mapTravelListResponse', () => {
  it('maps an array of TravelResponse to Travel entities', () => {
    const responses: TravelResponse[] = [
      {
        id: 'travel-1',
        user_id: 'user-1',
        purpose: 'Meeting',
        origin_city_id: 'city-1',
        destination_city_id: 'city-2',
        start_date: '2024-03-01',
        end_date: '2024-03-02',
        duration_days: 2,
        distance_km: 500,
        allowance_per_day: 500000,
        total_allowance: 1000000,
        status: 'pending',
        approved_by: null,
        approved_at: null,
      },
      {
        id: 'travel-2',
        user_id: 'user-2',
        purpose: 'Training',
        origin_city_id: 'city-3',
        destination_city_id: 'city-4',
        start_date: '2024-04-01',
        end_date: '2024-04-03',
        duration_days: 3,
        distance_km: 800,
        allowance_per_day: 600000,
        total_allowance: 1800000,
        status: 'approved',
        approved_by: 'admin-1',
        approved_at: '2024-03-20T09:00:00Z',
      },
    ];

    const result = mapTravelListResponse(responses);

    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe('user-1');
    expect(result[0].originCityId).toBe('city-1');
    expect(result[1].userId).toBe('user-2');
    expect(result[1].approvedBy).toBe('admin-1');
  });

  it('returns an empty array for empty input', () => {
    const result = mapTravelListResponse([]);
    expect(result).toEqual([]);
  });
});
