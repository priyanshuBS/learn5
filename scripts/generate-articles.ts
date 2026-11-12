/// <reference types="node" />
/**
 * generate-articles.ts — run with:  npm run generate-articles
 *
 * Every day at 04:00 (Asia/Kolkata) the cron job (.github/workflows/generate-articles.yml)
 * runs this. For each category the AI picks ONE topic by itself and writes a short
 * article about it in simple, easy English.
 *
 * For each category:
 *   1. ask the AI to choose a topic (not used in the last 90 days) and write the article
 *   2. check it in code: shape (ArticleSchema), length, short sentences (readability.ts)
 *   3. ask the AI to fact-check it
 *   4. save it — or retry with the problems as feedback (up to 3 attempts)
 *
 * Articles that already exist are skipped, so running it again is always safe.
 *
 * Options:
 *   --date=2026-11-12     this date (default: today)
 *   --category=english    only this category
 *   --dry-run             print instead of saving
 *
 * Needs: DATABASE_URL and GROQ_API_KEY (optional GROQ_MODEL).
 */
import { readabilityProblems, readingMinutes } from '../src/features/articles/readability';
import { ArticleSchema, isRealDate, type Article, type Category } from '../src/lib/schema';
import { getZonedNow } from '../src/lib/time';
import { recentArticleTopics, saveArticle } from '../src/server/articles';
import { getSql } from '../src/server/db';
import { categories, schedule } from '../src/server/drops';
import {
  ARTICLE_SYSTEM_PROMPT,
  ARTICLE_VERIFY_PROMPT,
  articleUserPrompt,
} from './lib/article-prompt';
import { formatZodError } from './lib/content-files';
import { notifyCrash, notifyRunProblems } from './lib/alerts';
import { chatJson, GROQ_MODEL, RateLimitExhaustedError } from './lib/groq';

const MAX_ATTEMPTS = 4;
/** Don't repeat a topic from the last this-many days. */
const TOPIC_WINDOW_DAYS = 90;

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'] as const;
  }),
);
const DRY_RUN = args.get('dry-run') === 'true';
const ONLY_CATEGORY = args.get('category');
const ONLY_DATE = args.get('date');

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Turns the AI's reply into an Article we can check: we set category, date and reading time. */
function toArticle(reply: string, category: string, date: string): unknown {
  const parsed = JSON.parse(reply) as Record<string, unknown>;
  const draft = {
    category,
    date,
    title: parsed.title,
    topic: parsed.topic,
    summary: parsed.summary,
    sections: parsed.sections,
    keyPoints: parsed.keyPoints,
    glossary: Array.isArray(parsed.glossary) ? parsed.glossary : [],
    source: parsed.source,
    readingMinutes: 1,
  };
  const shaped = ArticleSchema.safeParse(draft);
  return shaped.success ? { ...shaped.data, readingMinutes: readingMinutes(shaped.data) } : draft;
}

async function factCheck(article: Article): Promise<string[]> {
  const { category: _c, date: _d, readingMinutes: _r, ...body } = article;
  const reply = await chatJson(
    [
      { role: 'system', content: ARTICLE_VERIFY_PROMPT },
      { role: 'user', content: JSON.stringify(body) },
    ],
    { temperature: 0 },
  );
  const parsed = JSON.parse(reply) as { ok?: boolean; problems?: unknown[] };
  if (parsed.ok === true) return [];
  const problems = (parsed.problems ?? []).map(String).filter(Boolean);
  return problems.length > 0 ? problems : ['Failed the fact-check.'];
}

async function generateOne(category: Category, date: string): Promise<Article> {
  const recent = await recentArticleTopics(category.id, date, TOPIC_WINDOW_DAYS);
  const recentKeys = new Set(recent.map((t) => normalize(t.replace(/\s*\(.*\)$/, ''))));
  let feedback: string[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let reply: string;
    try {
      reply = await chatJson(
        [
          { role: 'system', content: ARTICLE_SYSTEM_PROMPT },
          {
            role: 'user',
            content: articleUserPrompt({ category, date, avoidTopics: recent, feedback }),
          },
        ],
        { maxTokens: 10000 },
      );
    } catch (err) {
      // A bad reply from the AI (e.g. broken JSON) is worth another try; a used-up limit is not.
      if (err instanceof RateLimitExhaustedError) throw err;
      feedback = ['Your reply was not valid JSON. Reply with ONE valid JSON object only.'];
      console.log(`    attempt ${attempt}: ${(err as Error).message}`);
      continue;
    }

    let candidate: unknown;
    try {
      candidate = toArticle(reply, category.id, date);
    } catch {
      feedback = ['Your reply was not valid JSON. Reply with the JSON object only.'];
      console.log(`    attempt ${attempt}: invalid JSON`);
      continue;
    }

    const parsed = ArticleSchema.safeParse(candidate);
    if (!parsed.success) {
      feedback = formatZodError(parsed.error);
      console.log(`    attempt ${attempt}: ${feedback.length} rule problem(s): ${feedback[0]}`);
      continue;
    }

    const problems = readabilityProblems(parsed.data);
    if (recentKeys.has(normalize(parsed.data.topic))) {
      problems.push(`The topic "${parsed.data.topic}" was covered recently. Choose another topic.`);
    }
    if (problems.length > 0) {
      feedback = problems;
      console.log(`    attempt ${attempt}: ${problems[0]}`);
      continue;
    }

    const wrong = await factCheck(parsed.data);
    if (wrong.length > 0) {
      feedback = [...wrong, 'Remove or fix anything you are not completely sure about.'];
      console.log(`    attempt ${attempt}: fact-check failed: ${wrong[0]}`);
      continue;
    }

    return parsed.data;
  }
  throw new Error(`no valid article after ${MAX_ATTEMPTS} attempts (last: ${feedback[0] ?? '?'})`);
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  if (ONLY_DATE && !isRealDate(ONLY_DATE)) throw new Error('--date must be YYYY-MM-DD');
  const date = ONLY_DATE ?? getZonedNow(schedule.timezone).date;
  const targets = categories.filter((c) => !ONLY_CATEGORY || c.id === ONLY_CATEGORY);
  if (targets.length === 0) throw new Error(`Unknown category "${ONLY_CATEGORY}"`);

  const sql = getSql();
  const existingRows = await sql`
    SELECT category FROM articles WHERE article_date = ${date}::date`;
  const existing = new Set(existingRows.map((r) => r.category as string));

  console.log(`Learn5 articles · model ${GROQ_MODEL} · ${date}${DRY_RUN ? ' · DRY RUN' : ''}`);
  let made = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const category of targets) {
    if (existing.has(category.id)) {
      skipped++;
      continue;
    }
    console.log(`• ${category.id}/${date}`);
    try {
      const article = await generateOne(category, date);
      if (DRY_RUN) console.log(JSON.stringify(article, null, 2));
      else await saveArticle(article, `groq:${GROQ_MODEL}`);
      console.log(`  ✔ "${article.title}" (${article.readingMinutes} min)`);
      made++;
    } catch (err) {
      if (err instanceof RateLimitExhaustedError) {
        console.error(`  ✖ ${err.message}. Stopping; the next run will continue.`);
        failed.push(`${category.id}: ${err.message}`);
        break;
      }
      console.error(`  ✖ ${(err as Error).message}`);
      failed.push(`${category.id}: ${(err as Error).message}`);
    }
  }

  console.log(`\nDone: ${made} new, ${skipped} already there, ${failed.length} failed.`);
  if (failed.length > 0) {
    console.error(`Failed: ${failed.join(', ')}`);
    await notifyRunProblems('articles', failed, made); // email the owner
    process.exit(1);
  }
}

main().catch(async (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('✖ Article generator crashed:', message);
  await notifyCrash('articles', message);
  process.exit(1);
});
