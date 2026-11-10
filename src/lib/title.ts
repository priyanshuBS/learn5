/**
 * displayTitle — a drop title as shown to people.
 * Older generated drops have titles like "Evening Physics Quiz – 2026-11-09";
 * the date (and the dash before it) is noise on screen, so it is dropped.
 */
export function displayTitle(title: string): string {
  const cleaned = title.replace(/\s*[-–—:|·]?\s*\(?\d{4}-\d{2}-\d{2}\)?\s*$/, '').trim();
  return cleaned || title;
}
