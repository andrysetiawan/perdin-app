import { describe, it, expect } from 'vitest';
import {
  getNavigationLinks,
  ADMIN_LINKS,
  HR_LINKS,
  EMPLOYEE_LINKS,
} from './navigation';

describe('navigation', () => {
  describe('getNavigationLinks', () => {
    it('returns admin links for admin role', () => {
      const links = getNavigationLinks(['admin']);
      expect(links).toEqual(ADMIN_LINKS);
    });

    it('returns HR links for hr role', () => {
      const links = getNavigationLinks(['hr']);
      expect(links).toEqual(HR_LINKS);
    });

    it('returns employee links for employee role', () => {
      const links = getNavigationLinks(['employee']);
      expect(links).toEqual(EMPLOYEE_LINKS);
    });

    it('returns empty array for no recognized roles', () => {
      const links = getNavigationLinks([]);
      expect(links).toEqual([]);
    });

    it('returns empty array for unknown roles', () => {
      const links = getNavigationLinks(['manager', 'director']);
      expect(links).toEqual([]);
    });

    it('is case-insensitive for role matching', () => {
      expect(getNavigationLinks(['Admin'])).toEqual(ADMIN_LINKS);
      expect(getNavigationLinks(['HR'])).toEqual(HR_LINKS);
      expect(getNavigationLinks(['EMPLOYEE'])).toEqual(EMPLOYEE_LINKS);
    });

    it('returns deduplicated union for admin + hr (admin ordering takes precedence)', () => {
      const links = getNavigationLinks(['admin', 'hr']);
      // Admin already includes all HR links, so result should be same as admin
      expect(links).toEqual(ADMIN_LINKS);
    });

    it('returns deduplicated union for admin + employee', () => {
      const links = getNavigationLinks(['admin', 'employee']);
      // Admin already includes all employee links
      expect(links).toEqual(ADMIN_LINKS);
    });

    it('returns deduplicated union for hr + employee', () => {
      const links = getNavigationLinks(['hr', 'employee']);
      // HR and Employee have the same links
      expect(links).toEqual(HR_LINKS);
    });

    it('returns deduplicated union for all three roles', () => {
      const links = getNavigationLinks(['admin', 'hr', 'employee']);
      // Admin is highest privilege, includes all links
      expect(links).toEqual(ADMIN_LINKS);
    });

    it('deduplicates by path', () => {
      const links = getNavigationLinks(['admin', 'hr', 'employee']);
      const paths = links.map((l) => l.path);
      const uniquePaths = [...new Set(paths)];
      expect(paths).toEqual(uniquePaths);
    });

    it('preserves ordering from highest-privilege role', () => {
      // Even if employee is listed first, admin ordering should take precedence
      const links = getNavigationLinks(['employee', 'admin']);
      expect(links).toEqual(ADMIN_LINKS);
    });

    it('handles mixed case roles with multiple roles', () => {
      const links = getNavigationLinks(['EMPLOYEE', 'Admin']);
      expect(links).toEqual(ADMIN_LINKS);
    });
  });
});
