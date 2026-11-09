/**
 * drops.ts — SERVER ONLY. Learning content stored in the database (table "drops").
 *
 *   getContentIndex() → the list of drops the app may show (like content/index.json)
 *   getOpenDrop()     → one drop's 5 questions, ONLY once its opening time has passed
 *   saveDrop()        → used by the generator and the seed script
 *
 * Categories and drop times still come from content/categories.json and
 * schedule.config.json, so there is one place to change them.
 */
import categoriesFile from '../../content/categories.json';
import scheduleFile from '../../schedule.config.json';
import { isOpen } from '../features/drops/status';
import { addDays } from '../lib/dates';
import {
  CategoriesFileSchema,
  DropSchema,
  ScheduleConfigSchema,
  type ContentIndex,
  type Drop,
} from '../lib/schema';
import { getZonedNow } from '../lib/time';

import { getSql } from './db';

export const categories = CategoriesFileSchema.parse(categoriesFile);
export const schedule = ScheduleConfigSchema.parse(scheduleFile);

/** How many past days the app's archive can show. Keeps the index small at any scale. */
export const ARCHIVE_DAYS = 90;

/** "math/2026-11-08/drop-2.json" — the same paths the app has always used. */
export function dropPath(category: string, date: string, drop: number): string {
  return `${category}/${date}/drop-${drop}.json`;
}

/** Reads "math/2026-11-08/drop-2.json". Null if it isn't a valid drop path. */
export function parseDropPath(
  path: string,
): { category: string; date: string; drop: number } | null {
  const m = /^([a-z][a-z0-9-]*)\/(\d{4}-\d{2}-\d{2})\/drop-([1-3])\.json$/.exec(path);
  return m ? { category: m[1], date: m[2], drop: Number(m[3]) } : null;
}

/** The content index: categories, drop times, and every drop up to today. */
export async function getContentIndex(now: Date = new Date()): Promise<ContentIndex> {
  const sql = getSql();
  const today = getZonedNow(schedule.timezone, now).date;
  const rows = await sql`
    SELECT category, drop_date::text AS date, drop_no, title, created_at
    FROM drops
    WHERE drop_date <= ${today}::date AND drop_date > ${addDays(today, -ARCHIVE_DAYS)}::date
    ORDER BY drop_date, category, drop_no`;

  const known = new Set(categories.map((c) => c.id));
  const order = new Map(categories.map((c, i) => [c.id, i]));
  const drops = rows
    .filter((r) => known.has(r.category))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0) ||
        a.drop_no - b.drop_no,
    )
    .map((r) => ({
      category: r.category as string,
      date: r.date as string,
      drop: r.drop_no as number,
      title: r.title as string,
      path: dropPath(r.category, r.date, r.drop_no),
    }));

  // Changes whenever a drop is added, so the app knows to refresh.
  const newest = rows.reduce((max, r) => Math.max(max, new Date(r.created_at).getTime()), 0);
  return {
    version: `${drops.length}-${newest.toString(36)}`,
    latestDate: drops.length > 0 ? drops[drops.length - 1].date : null,
    timezone: schedule.timezone,
    schedule: schedule.drops,
    categories,
    drops,
  };
}

export type OpenDropResult =
  { status: 'ok'; drop: Drop } | { status: 'not-found' } | { status: 'not-open' };

/** One drop — but only after its opening time, so nobody can peek at the answers early. */
export async function getOpenDrop(path: string, now: Date = new Date()): Promise<OpenDropResult> {
  const ref = parseDropPath(path);
  if (!ref) return { status: 'not-found' };
  const zonedNow = getZonedNow(schedule.timezone, now);
  if (!isOpen({ schedule: schedule.drops } as ContentIndex, ref, zonedNow)) {
    return { status: 'not-open' };
  }
  const sql = getSql();
  const [row] = await sql`
    SELECT title, items FROM drops
    WHERE category = ${ref.category} AND drop_date = ${ref.date}::date AND drop_no = ${ref.drop}`;
  if (!row) return { status: 'not-found' };
  const parsed = DropSchema.safeParse({ ...ref, title: row.title, items: row.items });
  return parsed.success ? { status: 'ok', drop: parsed.data } : { status: 'not-found' };
}

/** Saves a drop. Never overwrites an existing one. Returns true if it was new. */
export async function saveDrop(drop: Drop, source: string): Promise<boolean> {
  const checked = DropSchema.parse(drop);
  const sql = getSql();
  const rows = await sql`
    INSERT INTO drops (category, drop_date, drop_no, title, items, source)
    VALUES (${checked.category}, ${checked.date}::date, ${checked.drop}, ${checked.title},
            ${JSON.stringify(checked.items)}::jsonb, ${source})
    ON CONFLICT (category, drop_date, drop_no) DO NOTHING
    RETURNING drop_no`;
  return rows.length > 0;
}
