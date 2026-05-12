import type { City } from '@/domain/entities/city';
import type { CityFormData } from '@/domain/validators/city.validator';
import type { PaginationMeta, PaginationParams } from '@/shared/types';
import apiClient from '../api/client';
import { CITY_ENDPOINTS } from '../api/endpoints';
import { mapCityResponseToEntity, mapCityListResponse, type CityResponse } from '../mappers/city.mapper';

export async function listCities(params: PaginationParams): Promise<{ cities: City[]; meta: PaginationMeta }> {
  const response = await apiClient.get<{ success: boolean; data: CityResponse[]; meta: PaginationMeta }>(
    CITY_ENDPOINTS.LIST,
    { params },
  );

  return {
    cities: mapCityListResponse(response.data.data),
    meta: response.data.meta!,
  };
}

export async function getCityById(id: string): Promise<City> {
  const response = await apiClient.get<{ success: boolean; data: CityResponse }>(
    CITY_ENDPOINTS.GET(id),
  );

  return mapCityResponseToEntity(response.data.data);
}

export async function createCity(data: CityFormData): Promise<City> {
  const response = await apiClient.post<{ success: boolean; data: CityResponse }>(
    CITY_ENDPOINTS.CREATE,
    {
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      province: data.province,
      island: data.island,
      is_overseas: data.isOverseas,
    },
  );

  return mapCityResponseToEntity(response.data.data);
}

export async function updateCity(id: string, data: CityFormData): Promise<City> {
  const response = await apiClient.put<{ success: boolean; data: CityResponse }>(
    CITY_ENDPOINTS.UPDATE(id),
    {
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      province: data.province,
      island: data.island,
      is_overseas: data.isOverseas,
    },
  );

  return mapCityResponseToEntity(response.data.data);
}

export async function deleteCity(id: string): Promise<void> {
  await apiClient.delete(CITY_ENDPOINTS.DELETE(id));
}
