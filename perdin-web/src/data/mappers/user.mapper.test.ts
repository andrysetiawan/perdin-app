import { describe, it, expect } from 'vitest';
import {
  mapUserResponseToEntity,
  mapUserListResponse,
  type UserResponse,
} from './user.mapper';

describe('mapUserResponseToEntity', () => {
  it('maps a UserResponse to a User entity', () => {
    const response: UserResponse = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      roles: [
        { id: 'role-1', name: 'admin' },
        { id: 'role-2', name: 'employee' },
      ],
    };

    const result = mapUserResponseToEntity(response);

    expect(result).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      roles: [
        { id: 'role-1', name: 'admin' },
        { id: 'role-2', name: 'employee' },
      ],
    });
  });

  it('maps a user with empty roles array', () => {
    const response: UserResponse = {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      roles: [],
    };

    const result = mapUserResponseToEntity(response);

    expect(result).toEqual({
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      roles: [],
    });
  });
});

describe('mapUserListResponse', () => {
  it('maps an array of UserResponse to User entities', () => {
    const responses: UserResponse[] = [
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        roles: [{ id: 'role-1', name: 'hr' }],
      },
      {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        roles: [{ id: 'role-2', name: 'employee' }],
      },
    ];

    const result = mapUserListResponse(responses);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('user-1');
    expect(result[1].id).toBe('user-2');
  });

  it('returns an empty array for empty input', () => {
    const result = mapUserListResponse([]);
    expect(result).toEqual([]);
  });
});
