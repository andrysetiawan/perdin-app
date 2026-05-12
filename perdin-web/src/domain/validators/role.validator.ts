import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(50, 'Role name must be at most 50 characters'),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
