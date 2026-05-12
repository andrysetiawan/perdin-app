/**
 * Shared utility functions.
 */

/**
 * Formats an ISO date string (e.g. "2024-03-15") into a human-readable display format.
 * Uses the "dd MMM yyyy" pattern (e.g. "15 Mar 2024").
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats an ISO datetime string into a display format with date and time.
 * Uses "dd MMM yyyy, HH:mm" pattern (e.g. "15 Mar 2024, 14:30").
 */
export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (isNaN(date.getTime())) {
    return isoDateTime;
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Computes the total number of pages given a total item count and page size.
 * Returns a minimum of 1 page when total is 0.
 */
export function computeTotalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  if (total <= 0) return 1;
  return Math.ceil(total / pageSize);
}
