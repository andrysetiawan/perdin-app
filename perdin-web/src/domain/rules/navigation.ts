/**
 * Role-based navigation link computation.
 * Computes the deduplicated union of navigation links based on user roles.
 * Ordering follows the highest-privilege role (Admin > HR > Employee).
 */

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const ADMIN_LINKS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Travels', path: '/travels', icon: 'travel' },
  { label: 'Users', path: '/users', icon: 'users' },
  { label: 'Roles', path: '/roles', icon: 'roles' },
  { label: 'Cities', path: '/cities', icon: 'cities' },
  { label: 'Profile', path: '/profile', icon: 'profile' },
];

export const HR_LINKS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Travels', path: '/travels', icon: 'travel' },
  { label: 'Profile', path: '/profile', icon: 'profile' },
];

export const EMPLOYEE_LINKS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Travels', path: '/travels', icon: 'travel' },
  { label: 'Profile', path: '/profile', icon: 'profile' },
];

/**
 * Role privilege ordering: Admin > HR > Employee.
 * Used to determine which role's link ordering takes precedence.
 */
const ROLE_PRIORITY: { role: string; links: NavItem[] }[] = [
  { role: 'admin', links: ADMIN_LINKS },
  { role: 'hr', links: HR_LINKS },
  { role: 'employee', links: EMPLOYEE_LINKS },
];

/**
 * Computes the navigation links for a user based on their roles.
 *
 * - Takes the union of all links granted by each assigned role
 * - Deduplicates by path (first occurrence wins)
 * - Orders by the highest-privilege role's link ordering
 *
 * If no recognized roles are provided, returns an empty array.
 */
export function getNavigationLinks(roles: string[]): NavItem[] {
  const normalizedRoles = roles.map((r) => r.toLowerCase());

  // Collect all links from matching roles in priority order
  const allLinks: NavItem[] = [];
  for (const { role, links } of ROLE_PRIORITY) {
    if (normalizedRoles.includes(role)) {
      allLinks.push(...links);
    }
  }

  // Deduplicate by path, preserving first occurrence (highest-privilege ordering)
  const seen = new Set<string>();
  const result: NavItem[] = [];
  for (const link of allLinks) {
    if (!seen.has(link.path)) {
      seen.add(link.path);
      result.push(link);
    }
  }

  return result;
}
