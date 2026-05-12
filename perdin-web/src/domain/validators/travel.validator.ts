import { z } from 'zod';

export const travelFormSchema = z
  .object({
    purpose: z.string().min(5, 'Purpose must be at least 5 characters').max(255, 'Purpose must be at most 255 characters'),
    originCityId: z.string().uuid('Invalid origin city'),
    destinationCityId: z.string().uuid('Invalid destination city'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  })
  .refine((data) => data.originCityId !== data.destinationCityId, {
    message: 'Origin and destination must be different',
    path: ['destinationCityId'],
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export type TravelFormData = z.infer<typeof travelFormSchema>;
