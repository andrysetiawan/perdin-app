import type { City } from '@/domain/entities/city';

export interface CityResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  province: string;
  island: string;
  is_overseas: boolean;
}

export function mapCityResponseToEntity(response: CityResponse): City {
  return {
    id: response.id,
    name: response.name,
    latitude: response.latitude,
    longitude: response.longitude,
    province: response.province,
    island: response.island,
    isOverseas: response.is_overseas,
  };
}

export function mapCityListResponse(responses: CityResponse[]): City[] {
  return responses.map(mapCityResponseToEntity);
}
