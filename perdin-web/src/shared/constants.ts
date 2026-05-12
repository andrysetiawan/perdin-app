/**
 * Application-wide constants.
 */

/** Base URL for the Perdin Service API */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/** Available page size options for paginated lists */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/** Default number of items per page */
export const DEFAULT_PAGE_SIZE = 10;

/** Maximum number of toast notifications displayed simultaneously */
export const MAX_NOTIFICATIONS = 5;

/** Duration in milliseconds before a success notification auto-dismisses */
export const NOTIFICATION_AUTO_DISMISS_MS = 5000;
