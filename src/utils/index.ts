import { format, parseISO } from 'date-fns';

/**
 * Format a numeric value as US dollars currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format an ISO date string to a human-readable date
 */
export function formatDate(dateString: string, pattern = 'MMM dd, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, pattern);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Truncate long strings with ellipses
 */
export function truncateString(str: string, length = 30): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
