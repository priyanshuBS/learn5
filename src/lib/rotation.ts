/**
 * rotation.ts — which subject gets the day's ONE article.
 *
 * schedule.config.json lists the order (articleRotation) and the date that
 * gets the first subject (articleRotationStart). Each day moves on by one:
 * Math → Reasoning → English → Computer Science → Math …
 */
import { daysBetween } from './dates';

/** The category id whose article is written and shown on `date`. */
export function articleCategoryFor(date: string, rotation: string[], start: string): string | null {
  if (rotation.length === 0) return null;
  const n = rotation.length;
  return rotation[((daysBetween(start, date) % n) + n) % n];
}

/** True when `date` is in the one-article-a-day era (older days had one per subject). */
export function isRotationDay(date: string, start: string): boolean {
  return date >= start;
}

/** The day's article subject from the content index (null for older indexes without a rotation). */
export function scheduledArticleCategory(
  index: { articleRotation?: string[]; articleRotationStart?: string },
  date: string,
): string | null {
  if (!index.articleRotation || !index.articleRotationStart) return null;
  if (!isRotationDay(date, index.articleRotationStart)) return null;
  return articleCategoryFor(date, index.articleRotation, index.articleRotationStart);
}
