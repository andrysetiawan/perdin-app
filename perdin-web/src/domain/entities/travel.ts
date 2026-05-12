export type TravelStatus = 'pending' | 'approved' | 'rejected';

export interface Travel {
  id: string;
  userId: string;
  userName: string;
  purpose: string;
  originCityId: string;
  originCityName: string;
  destinationCityId: string;
  destinationCityName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  distanceKm: number;
  allowancePerDay: number;
  totalAllowance: number;
  status: TravelStatus;
  approvedBy: string | null;
  approvedAt: string | null;
}
