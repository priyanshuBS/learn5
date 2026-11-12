/**
 * articles.ts — SERVER ONLY. The daily articles stored in the database (table "articles").
 *
 *   listArticles() → recent articles for the list (no body)
 *   getArticle()   → one full article, ONLY once it is published
 *   saveArticle()  → used by the generator
 *
 * An article for a day is published at the "articles" time in schedule.config.json
 * (04:00 in the content time zone), when the generator writes it.
 */
import { addDays } from '../lib/dates';
import { ArticleSchema, type Article, type ArticleSummary } from '../lib/schema';
import { getZonedNow, timeToMinutes } from '../lib/time';

import { getSql } from './db';
import { schedule } from './drops';

/** How many past days the article list shows. */
export const ARTICLE_ARCHIVE_DAYS = 60;

/** True once the article for `date` may be read. */
export function isArticlePublished(date: string, now: Date = new Date()): boolean {
  const zoned = getZonedNow(schedule.timezone, now);
  if (date < zoned.date) return true;
  if (date > zoned.date) return false;
  return zoned.minutes >= timeToMinutes(schedule.articles);
}

/** Recent published articles, newest first. */
export async function listArticles(now: Date = new Date()): Promise<ArticleSummary[]> {
  const sql = getSql();
  const today = getZonedNow(schedule.timezone, now).date;
  const rows = await sql`
    SELECT category, article_date::text AS date, title, topic, summary, reading_minutes
    FROM articles
    WHERE article_date <= ${today}::date
      AND article_date > ${addDays(today, -ARTICLE_ARCHIVE_DAYS)}::date
    ORDER BY article_date DESC, category`;
  return rows
    .filter((r) => isArticlePublished(r.date, now))
    .map((r) => ({
      category: r.category as string,
      date: r.date as string,
      title: r.title as string,
      topic: r.topic as string,
      summary: r.summary as string,
      readingMinutes: r.reading_minutes as number,
    }));
}

export type ArticleResult =
  { status: 'ok'; article: Article } | { status: 'not-found' } | { status: 'not-published' };

export async function getArticle(
  category: string,
  date: string,
  now: Date = new Date(),
): Promise<ArticleResult> {
  if (!/^[a-z][a-z0-9-]*$/.test(category) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { status: 'not-found' };
  }
  if (!isArticlePublished(date, now)) return { status: 'not-published' };
  const sql = getSql();
  const [row] = await sql`
    SELECT body FROM articles WHERE category = ${category} AND article_date = ${date}::date`;
  if (!row) return { status: 'not-found' };
  const parsed = ArticleSchema.safeParse(row.body);
  return parsed.success ? { status: 'ok', article: parsed.data } : { status: 'not-found' };
}

/** Saves an article. Never overwrites an existing one. Returns true if it was new. */
export async function saveArticle(article: Article, source: string): Promise<boolean> {
  const checked = ArticleSchema.parse(article);
  const sql = getSql();
  const rows = await sql`
    INSERT INTO articles (category, article_date, title, topic, summary, reading_minutes, body, source)
    VALUES (${checked.category}, ${checked.date}::date, ${checked.title}, ${checked.topic},
            ${checked.summary}, ${checked.readingMinutes}, ${JSON.stringify(checked)}::jsonb, ${source})
    ON CONFLICT (category, article_date) DO NOTHING
    RETURNING category`;
  return rows.length > 0;
}

/** Topics of a category's articles in the last `days` days (to avoid repeats). */
export async function recentArticleTopics(
  category: string,
  date: string,
  days: number,
): Promise<string[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT topic, title FROM articles
    WHERE category = ${category}
      AND article_date BETWEEN ${addDays(date, -days)}::date AND ${date}::date
    ORDER BY article_date DESC`;
  return rows.map((r) => `${r.topic} (${r.title})`);
}
