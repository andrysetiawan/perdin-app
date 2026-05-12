import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getNavigationLinks,
  ADMIN_LINKS,
  HR_LINKS,
  EMPLOYEE_LINKS,
} from '../navigation';
import type { NavItem } from '../navigation';

/**
 * Feature: perdin-dashboard, Property 2: Role-based navigation link computation
 *
 * Validates: Requirements 3.1, 3.5
 *
 * For any set of user roles (drawn from the set {admin, hr, employee}),
 * the getNavigationLinks function SHALL return the deduplicated union of all
 * navigation links granted by each role, ordered according to the highest-privilege
 * role's ordering, with no duplicate paths.
 */

const VALID_ROLES = ['admin', 'hr', 'employee'] as const;

/** Maps role name (lowercase) to its link set */
const ROLE_LINKS_MAP: Record<string, NavItem[]> = {
  admin: ADMIN_LINKS,
  hr: HR_LINKS,
  employee: EMPLOYEE_LINKS,
};

/** Role priority order (highest first) */
const ROLE_PRIORITY = ['admin', 'hr', 'employee'];

/**
 * Arbitrary that generates subsets of valid roles with various casings.
 */
const rolesArbitrary = fc
  .shuffledSubarray([...VALID_ROLES])
  .chain((subset) =>
    fc.tuple(
      fc.constant(subset),
      fc.array(
        fc.constantFrom('lower', 'upper', 'capitalized', 'mixed'),
        { minLength: subset.length, maxLength: subset.length }
      )
    )
  )
  .map(([subset, casings]) =>
    subset.map((role, i) => {
      switch (casings[i]) {
        case 'upper':
          return role.toUpperCase();
        case 'capitalized':
          return role.charAt(0).toUpperCase() + role.slice(1);
        case 'mixed':
          return role
            .split('')
            .map((c, j) => (j % 2 === 0 ? c.toUpperCase() : c.toLowerCase()))
            .join('');
        default:
          return role;
      }
    })
  );

describe('Feature: perdin-dashboard, Property 2: Role-based navigation link computation', () => {
  it('Result never contains duplicate paths', () => {
    fc.assert(
      fc.property(rolesArbitrary, (roles) => {
        const links = getNavigationLinks(roles);
        const paths = links.map((l) => l.path);
        const uniquePaths = new Set(paths);
        expect(paths.length).toBe(uniquePaths.size);
      }),
      { numRuns: 100 }
    );
  });

  it('Result is a subset of the union of all role-specific link sets for the given roles', () => {
    fc.assert(
      fc.property(rolesArbitrary, (roles) => {
        const links = getNavigationLinks(roles);
        const normalizedRoles = roles.map((r) => r.toLowerCase());

        // Compute the union of all paths from the assigned roles
        const allowedPaths = new Set<string>();
        for (const role of normalizedRoles) {
          const roleLinks = ROLE_LINKS_MAP[role];
          if (roleLinks) {
            for (const link of roleLinks) {
              allowedPaths.add(link.path);
            }
          }
        }

        // Every path in the result must be in the allowed set
        for (const link of links) {
          expect(allowedPaths.has(link.path)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Every link from each assigned role link set appears in the result', () => {
    fc.assert(
      fc.property(rolesArbitrary, (roles) => {
        const links = getNavigationLinks(roles);
        const resultPaths = new Set(links.map((l) => l.path));
        const normalizedRoles = roles.map((r) => r.toLowerCase());

        // Every path from each assigned role's link set must appear in the result
        for (const role of normalizedRoles) {
          const roleLinks = ROLE_LINKS_MAP[role];
          if (roleLinks) {
            for (const roleLink of roleLinks) {
              expect(resultPaths.has(roleLink.path)).toBe(true);
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('If admin is in roles, result equals ADMIN_LINKS (since admin has all links)', () => {
    fc.assert(
      fc.property(rolesArbitrary, (roles) => {
        const normalizedRoles = roles.map((r) => r.toLowerCase());
        if (normalizedRoles.includes('admin')) {
          const links = getNavigationLinks(roles);
          expect(links).toEqual(ADMIN_LINKS);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Result ordering follows highest-privilege role ordering', () => {
    fc.assert(
      fc.property(rolesArbitrary, (roles) => {
        const links = getNavigationLinks(roles);
        if (links.length === 0) return; // No recognized roles

        const normalizedRoles = roles.map((r) => r.toLowerCase());

        // Find the highest-privilege role present
        const highestRole = ROLE_PRIORITY.find((r) =>
          normalizedRoles.includes(r)
        );
        if (!highestRole) return;

        const highestRoleLinks = ROLE_LINKS_MAP[highestRole];

        // The result should start with the highest-privilege role's links in order
        // (since deduplication preserves first occurrence from priority ordering)
        const resultPaths = links.map((l) => l.path);
        const highestRolePaths = highestRoleLinks.map((l) => l.path);

        // All paths from the highest-privilege role should appear in the same relative order
        const highestRolePathsInResult = resultPaths.filter((p) =>
          highestRolePaths.includes(p)
        );
        expect(highestRolePathsInResult).toEqual(highestRolePaths);
      }),
      { numRuns: 100 }
    );
  });
});
