import type { User } from '@/domain/entities/user';
import type { Role } from '@/domain/entities/role';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
}

export function mapUserResponseToEntity(response: UserResponse): User {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
    roles: response.roles.map<Role>((role) => ({
      id: role.id,
      name: role.name,
    })),
  };
}

export function mapUserListResponse(responses: UserResponse[]): User[] {
  return responses.map(mapUserResponseToEntity);
}
