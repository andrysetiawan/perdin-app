/**
 * Role-based permission rules.
 * All role comparisons are case-insensitive.
 */

/**
 * Check if the given roles array contains a specific role (case-insensitive).
 */
export function hasRole(roles: string[], role: string): boolean {
  const normalizedRole = role.toLowerCase();
  return roles.some((r) => r.toLowerCase() === normalizedRole);
}

/**
 * Check if the user has the Admin role.
 */
export function isAdmin(roles: string[]): boolean {
  return hasRole(roles, 'admin');
}

/**
 * Check if the user has the HR role.
 */
export function isHR(roles: string[]): boolean {
  return hasRole(roles, 'hr');
}

/**
 * Check if the user has the Employee role.
 */
export function isEmployee(roles: string[]): boolean {
  return hasRole(roles, 'employee');
}

/**
 * Check if the user can access admin-only routes (Users, Roles, Cities management).
 * Only users with the Admin role have access.
 */
export function canAccessAdminRoutes(roles: string[]): boolean {
  return isAdmin(roles);
}

/**
 * Check if the user can approve or reject travel requests.
 * Admin and HR roles can approve travel.
 */
export function canApproveTravel(roles: string[]): boolean {
  return isAdmin(roles) || isHR(roles);
}
