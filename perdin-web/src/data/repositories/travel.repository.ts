import type { Travel } from '@/domain/entities/travel';
import type { TravelFormData } from '@/domain/validators/travel.validator';
import type { PaginationMeta, PaginationParams } from '@/shared/types';
import apiClient from '../api/client';
import { TRAVEL_ENDPOINTS } from '../api/endpoints';
import { mapTravelResponseToEntity, mapTravelListResponse, type TravelResponse } from '../mappers/travel.mapper';

export async function listTravels(
  params: PaginationParams & { status?: string; userId?: string },
): Promise<{ travels: Travel[]; meta: PaginationMeta }> {
  const response = await apiClient.get<{ success: boolean; data: TravelResponse[]; meta: PaginationMeta }>(
    TRAVEL_ENDPOINTS.LIST,
    { params },
  );

  return {
    travels: mapTravelListResponse(response.data.data),
    meta: response.data.meta!,
  };
}

export async function getTravelById(id: string): Promise<Travel> {
  const response = await apiClient.get<{ success: boolean; data: TravelResponse }>(
    TRAVEL_ENDPOINTS.GET(id),
  );

  return mapTravelResponseToEntity(response.data.data);
}

export async function createTravel(data: TravelFormData): Promise<Travel> {
  const response = await apiClient.post<{ success: boolean; data: TravelResponse }>(
    TRAVEL_ENDPOINTS.CREATE,
    {
      purpose: data.purpose,
      origin_city_id: data.originCityId,
      destination_city_id: data.destinationCityId,
      start_date: data.startDate,
      end_date: data.endDate,
    },
  );

  return mapTravelResponseToEntity(response.data.data);
}

export async function updateTravel(id: string, data: TravelFormData): Promise<Travel> {
  const response = await apiClient.put<{ success: boolean; data: TravelResponse }>(
    TRAVEL_ENDPOINTS.UPDATE(id),
    {
      purpose: data.purpose,
      origin_city_id: data.originCityId,
      destination_city_id: data.destinationCityId,
      start_date: data.startDate,
      end_date: data.endDate,
    },
  );

  return mapTravelResponseToEntity(response.data.data);
}

export async function deleteTravel(id: string): Promise<void> {
  await apiClient.delete(TRAVEL_ENDPOINTS.DELETE(id));
}

export async function approveTravel(id: string): Promise<Travel> {
  const response = await apiClient.post<{ success: boolean; data: TravelResponse }>(
    TRAVEL_ENDPOINTS.APPROVE(id),
  );

  return mapTravelResponseToEntity(response.data.data);
}

export async function rejectTravel(id: string): Promise<Travel> {
  const response = await apiClient.post<{ success: boolean; data: TravelResponse }>(
    TRAVEL_ENDPOINTS.REJECT(id),
  );

  return mapTravelResponseToEntity(response.data.data);
}
