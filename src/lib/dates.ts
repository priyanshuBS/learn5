/**
 * dates.ts — tiny date helpers shared by the app and the scripts.
 *
 * We store dates as plain "YYYY-MM-DD" strings (no time, no time zone),
 * which keeps file names, comparisons and sorting simple.
 */

/** Today's date on THIS device/computer, as "YYYY-MM-DD" (local time, not UTC). */
export function todayLocal(now: Date = new Date()): string {
  return toDateString(now);
}

/** Converts a Date into a local "YYYY-MM-DD" string. */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Turns "YYYY-MM-DD" into a day number so we can subtract dates safely. */
function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Whole days from `a` to `b` (positive when b is later). */
export function daysBetween(a: string, b: string): number {
  return dayNumber(b) - dayNumber(a);
}

/** Adds (or subtracts, with a negative number) days to a "YYYY-MM-DD" date. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const result = new Date(Date.UTC(y, m - 1, d + days));
  return result.toISOString().slice(0, 10);
}
