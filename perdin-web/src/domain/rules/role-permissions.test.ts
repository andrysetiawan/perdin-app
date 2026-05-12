import { describe, it, expect } from 'vitest';
import {
  hasRole,
  isAdmin,
  isHR,
  isEmployee,
  canAccessAdminRoutes,
  canApproveTravel,
} from './role-permissions';

describe('role-permissions', () => {
  describe('hasRole', () => {
    it('returns true when role exists in array', () => {
      expect(hasRole(['admin', 'hr'], 'admin')).toBe(true);
    });

    it('returns false when role does not exist', () => {
      expect(hasRole(['employee'], 'admin')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(hasRole(['Admin'], 'admin')).toBe(true);
      expect(hasRole(['ADMIN'], 'admin')).toBe(true);
      expect(hasRole(['admin'], 'ADMIN')).toBe(true);
    });

    it('returns false for empty roles array', () => {
      expect(hasRole([], 'admin')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true when admin role is present', () => {
      expect(isAdmin(['admin'])).toBe(true);
      expect(isAdmin(['Admin'])).toBe(true);
      expect(isAdmin(['employee', 'admin'])).toBe(true);
    });

    it('returns false when admin role is absent', () => {
      expect(isAdmin(['employee'])).toBe(false);
      expect(isAdmin(['hr'])).toBe(false);
      expect(isAdmin([])).toBe(false);
    });
  });

  describe('isHR', () => {
    it('returns true when hr role is present', () => {
      expect(isHR(['hr'])).toBe(true);
      expect(isHR(['HR'])).toBe(true);
      expect(isHR(['employee', 'hr'])).toBe(true);
    });

    it('returns false when hr role is absent', () => {
      expect(isHR(['employee'])).toBe(false);
      expect(isHR(['admin'])).toBe(false);
      expect(isHR([])).toBe(false);
    });
  });

  describe('isEmployee', () => {
    it('returns true when employee role is present', () => {
      expect(isEmployee(['employee'])).toBe(true);
      expect(isEmployee(['Employee'])).toBe(true);
    });

    it('returns false when employee role is absent', () => {
      expect(isEmployee(['admin'])).toBe(false);
      expect(isEmployee([])).toBe(false);
    });
  });

  describe('canAccessAdminRoutes', () => {
    it('returns true only for admin role', () => {
      expect(canAccessAdminRoutes(['admin'])).toBe(true);
      expect(canAccessAdminRoutes(['admin', 'hr'])).toBe(true);
    });

    it('returns false for non-admin roles', () => {
      expect(canAccessAdminRoutes(['hr'])).toBe(false);
      expect(canAccessAdminRoutes(['employee'])).toBe(false);
      expect(canAccessAdminRoutes(['hr', 'employee'])).toBe(false);
      expect(canAccessAdminRoutes([])).toBe(false);
    });
  });

  describe('canApproveTravel', () => {
    it('returns true for admin', () => {
      expect(canApproveTravel(['admin'])).toBe(true);
    });

    it('returns true for hr', () => {
      expect(canApproveTravel(['hr'])).toBe(true);
    });

    it('returns true for admin and hr combined', () => {
      expect(canApproveTravel(['admin', 'hr'])).toBe(true);
    });

    it('returns false for employee only', () => {
      expect(canApproveTravel(['employee'])).toBe(false);
    });

    it('returns false for empty roles', () => {
      expect(canApproveTravel([])).toBe(false);
    });
  });
});
