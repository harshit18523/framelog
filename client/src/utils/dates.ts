import { format, parseISO } from 'date-fns';

/** The app's "today" — keeps mock data and new diary entries consistent. */
export const TODAY_ISO = '2026-09-29';

export function formatDay(iso: string, pattern: string): string {
  return format(parseISO(iso), pattern);
}