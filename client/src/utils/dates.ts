import { format, parseISO } from 'date-fns';

/** Returns the real current date formatted as YYYY-MM-DD */
export const getTodayIso = (): string => format(new Date(), 'yyyy-MM-dd');

/** The app's dynamic "today" date string in YYYY-MM-DD */
export const TODAY_ISO = format(new Date(), 'yyyy-MM-dd');

export function formatDay(iso: string, pattern: string): string {
  try {
    if (!iso) return '';
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}