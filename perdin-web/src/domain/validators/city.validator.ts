import { z } from 'zod';

export const cityFormSchema = z.object({
  name: z.string().min(2, 'City name must be at least 2 characters').max(100, 'City name must be at most 100 characters'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  province: z.string().min(1, 'Province is required'),
  island: z.string().min(1, 'Island is required'),
  isOverseas: z.boolean().default(false),
});

export type CityFormData = z.infer<typeof cityFormSchema>;
