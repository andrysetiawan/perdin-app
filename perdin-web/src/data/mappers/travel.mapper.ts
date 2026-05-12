import type { Travel, TravelStatus } from '@/domain/entities/travel';

export interface TravelResponse {
  id: string;
  user_id: string;
  user_name: string;
  purpose: string;
  origin_city_id: string;
  origin_city_name: string;
  destination_city_id: string;
  destination_city_name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  distance_km: number;
  allowance_per_day: number;
  total_allowance: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
}

export function mapTravelResponseToEntity(response: TravelResponse): Travel {
  return {
    id: response.id,
    userId: response.user_id,
    userName: response.user_name ?? '',
    purpose: response.purpose,
    originCityId: response.origin_city_id,
    originCityName: response.origin_city_name ?? '',
    destinationCityId: response.destination_city_id,
    destinationCityName: response.destination_city_name ?? '',
    startDate: response.start_date,
    endDate: response.end_date,
    durationDays: response.duration_days,
    distanceKm: response.distance_km,
    allowancePerDay: response.allowance_per_day,
    totalAllowance: response.total_allowance,
    status: response.status as TravelStatus,
    approvedBy: response.approved_by,
    approvedAt: response.approved_at,
  };
}

export function mapTravelListResponse(responses: TravelResponse[]): Travel[] {
  return responses.map(mapTravelResponseToEntity);
}
