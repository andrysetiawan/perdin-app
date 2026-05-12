/**
 * API endpoint constants for the Perdin Service.
 */

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
} as const;

export const USER_ENDPOINTS = {
  LIST: '/users',
  CREATE: '/users',
  GET: (id: string) => `/users/${id}`,
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
  ASSIGN_ROLE: (userId: string, roleId: string) => `/users/${userId}/roles/${roleId}`,
  REMOVE_ROLE: (userId: string, roleId: string) => `/users/${userId}/roles/${roleId}`,
} as const;

export const ROLE_ENDPOINTS = {
  LIST: '/roles',
  CREATE: '/roles',
  DELETE: (id: string) => `/roles/${id}`,
} as const;

export const CITY_ENDPOINTS = {
  LIST: '/cities',
  CREATE: '/cities',
  GET: (id: string) => `/cities/${id}`,
  UPDATE: (id: string) => `/cities/${id}`,
  DELETE: (id: string) => `/cities/${id}`,
} as const;

export const TRAVEL_ENDPOINTS = {
  LIST: '/travels',
  CREATE: '/travels',
  GET: (id: string) => `/travels/${id}`,
  UPDATE: (id: string) => `/travels/${id}`,
  DELETE: (id: string) => `/travels/${id}`,
  APPROVE: (id: string) => `/travels/${id}/approve`,
  REJECT: (id: string) => `/travels/${id}/reject`,
} as const;

export const PROFILE_ENDPOINTS = {
  GET: '/profile',
  CHANGE_PASSWORD: '/profile/change-password',
} as const;
