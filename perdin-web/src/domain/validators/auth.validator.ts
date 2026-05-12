import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(254),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
});

export type LoginFormData = z.infer<typeof loginSchema>;
