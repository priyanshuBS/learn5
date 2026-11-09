/// <reference types="node" />
/**
 * generate-drops.ts — run with:  npm run generate-drops
 *
 * Writes missing drops with the Groq AI and saves them in the database.
 * Run by the cron job (.github/workflows/generate-drops.yml) twice a day.
 *
 * By default it fills TODAY and TOMORROW (content time zone, Asia/Kolkata):
 * drops that already exist are skipped, so running it again is always safe,
 * and a failed run is simply finished by the next one.
 *
 * For each drop:
 *   1. ask the AI for 5 items (rules: scripts/lib/prompt.ts + CONTENT_GUIDE.md)
 *   2. check it in code: schema, ids, type/difficulty mix, no repeated topics (30 days)
 *      or questions (60 days)
 *   3. ask the AI to fact-check every answer
 *   4. save it — or retry with the problems as feedback (up to 3 attempts)
 *
 * Options:
 *   --date=2026-11-10     only this date
 *   --category=math       only this category
 *   --dry-run             print instead of saving
 *
 * Needs: DATABASE_URL and GROQ_API_KEY (optional GROQ_MODEL).
 */
import { addDays, daysBetween } from '../src/lib/dates';
import { DropSchema, isRealDate, makeItemId, type Category, type Drop } from '../src/lib/schema';
import { getZonedNow } from '../src/lib/time';
import { getSql } from '../src/server/db';
import { categories, saveDrop, schedule } from '../src/server/drops';
import { formatZodError } from './lib/content-files';
import { chatJson, GROQ_MODEL, RateLimitExhaustedError } from './lib/groq';
import { SYSTEM_PROMPT, userPrompt, VERIFY_SYSTEM_PROMPT } from './lib/prompt';

const MAX_ATTEMPTS = 3;
const TOPIC_WINDOW_DAYS = 30;
const QUESTION_WINDOW_DAYS = 60;
const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 } as const;

// ── Command-line options ──
const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'] as const;
  }),
);
const DRY_RUN = args.get('dry-run') === 'true';
const ONLY_CATEGORY = args.get('category');
const ONLY_DATE = args.get('date');

/** Lower-case letters/numbers only, so tiny wording changes still count as the same. */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

type RawItem = Record<string, unknown>;

/** What already exists near this date (to avoid repeats). */
async function loadHistory(category: string, date: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT category, drop_date::text AS date, items FROM drops
    WHERE drop_date BETWEEN ${addDays(date, -QUESTION_WINDOW_DAYS)}::date
                        AND ${addDays(date, QUESTION_WINDOW_DAYS)}::date`;
  const topics = new Set<string>();
  const topicNames: string[] = [];
  const questions = new Set<string>();
  for (const row of rows) {
    for (const item of row.items as RawItem[]) {
      const text = String(item.type === 'fact_card' ? item.fact : item.question);
      questions.add(normalize(text));
      if (row.category === category && Math.abs(daysBetween(row.date, date)) <= TOPIC_WINDOW_DAYS) {
        const t = normalize(String(item.topic));
        if (!topics.has(t)) topicNames.push(String(item.topic));
        topics.add(t);
      }
    }
  }
  return { topics, topicNames, questions };
}

/** Turns the AI's reply into a Drop we can check: we set ids/date/category ourselves. */
function toDrop(reply: string, category: string, date: string, drop: number): unknown {
  const parsed = JSON.parse(reply) as { title?: unknown; items?: RawItem[] };
  const items = (Array.isArray(parsed.items) ? parsed.items : [])
    .map((it, i) => ({ it, i }))
    // easy → medium → hard (stable), as the rules require
    .sort(
      (a, b) =>
        (DIFFICULTY_ORDER[a.it.difficulty as keyof typeof DIFFICULTY_ORDER] ?? 9) -
          (DIFFICULTY_ORDER[b.it.difficulty as keyof typeof DIFFICULTY_ORDER] ?? 9) || a.i - b.i,
    )
    .map(({ it }, i) => {
      const { id: _ignored, ...rest } = it;
      const item: RawItem = { ...rest, id: makeItemId(category, date, drop, i + 1) };
      if (item.type === 'true_false') item.options = ['True', 'False'];
      if (typeof item.answerIndex === 'string') item.answerIndex = Number(item.answerIndex);
      if (item.funFact === '' || item.funFact === null) delete item.funFact;
      if (Array.isArray(item.acceptedAnswers)) {
        // Drop repeats of the main answer and duplicates.
        const main = normalize(String(item.answer ?? ''));
        const seen = new Set<string>();
        const extra = item.acceptedAnswers.filter((a) => {
          const n = normalize(String(a));
          if (!n || n === main || seen.has(n)) return false;
          seen.add(n);
          return true;
        });
        if (extra.length > 0) item.acceptedAnswers = extra;
        else delete item.acceptedAnswers;
      }
      return item;
    });
  spreadMcqAnswers(items);
  return { date, category, drop, title: parsed.title, items };
}

/**
 * If every mcq has its right answer in the same position, swap one item's right
 * option into another position. (Option order doesn't matter; this saves a whole retry.)
 */
function spreadMcqAnswers(items: RawItem[]): void {
  const mcqs = items.filter(
    (i) => i.type === 'mcq' && Array.isArray(i.options) && typeof i.answerIndex === 'number',
  );
  if (mcqs.length < 2 || new Set(mcqs.map((i) => i.answerIndex)).size > 1) return;
  const item = mcqs[1];
  const options = [...(item.options as unknown[])];
  const from = item.answerIndex as number;
  const to = (from + 2) % options.length;
  [options[from], options[to]] = [options[to], options[from]];
  item.options = options;
  item.answerIndex = to;
}

/** Rules beyond the schema. Returns problems (empty = fine). */
function extraChecks(drop: Drop, history: Awaited<ReturnType<typeof loadHistory>>): string[] {
  const problems: string[] = [];
  // Titles should name the topics, not the slot or date (e.g. not "Morning Science Quiz – 2026-11-10").
  if (/\d{4}-\d{2}-\d{2}|(morning|afternoon|evening|quiz|drop)/i.test(drop.title)) {
    problems.push(
      `Title "${drop.title}" is too generic. Name the topics instead (no time of day, date, "quiz" or "drop").`,
    );
  }
  const mcqAnswers = drop.items.flatMap((i) => (i.type === 'mcq' ? [i.answerIndex] : []));
  if (new Set(mcqAnswers).size < 2) {
    problems.push('The 3 mcq items all have the same answerIndex. Spread the right answers.');
  }
  for (const item of drop.items) {
    if (history.topics.has(normalize(item.topic))) {
      problems.push(`Topic "${item.topic}" was used recently. Pick a different topic.`);
    }
    const text = item.type === 'fact_card' ? item.fact : item.question;
    if (history.questions.has(normalize(text))) {
      problems.push(`"${text}" was already asked recently. Write a new question.`);
    }
  }
  return problems;
}

/** Asks the AI to fact-check each item. Returns problems (empty = all correct). */
async function factCheck(drop: Drop): Promise<string[]> {
  const reply = await chatJson(
    [
      { role: 'system', content: VERIFY_SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(drop.items.map(({ id: _id, ...rest }) => rest)) },
    ],
    { temperature: 0 },
  );
  const parsed = JSON.parse(reply) as {
    items?: { position?: number; ok?: boolean; problem?: string }[];
  };
  const checks = parsed.items ?? [];
  if (checks.length < drop.items.length) return ['Fact-check incomplete; please try again.'];
  return checks
    .filter((c) => c.ok !== true)
    .map((c) => `Item ${c.position ?? '?'}: ${c.problem || 'failed the fact-check'}`);
}

async function generateOne(category: Category, date: string, drop: number): Promise<Drop> {
  const history = await loadHistory(category.id, date);
  let feedback: string[] = [];
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const reply = await chatJson([
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: userPrompt({ category, date, drop, avoidTopics: history.topicNames, feedback }),
      },
    ]);

    let candidate: unknown;
    try {
      candidate = toDrop(reply, category.id, date, drop);
    } catch {
      feedback = ['Your reply was not valid JSON. Reply with the JSON object only.'];
      console.log(`    attempt ${attempt}: invalid JSON`);
      continue;
    }

    const parsed = DropSchema.safeParse(candidate);
    if (!parsed.success) {
      feedback = formatZodError(parsed.error);
      console.log(`    attempt ${attempt}: ${feedback.length} rule problem(s): ${feedback[0]}`);
      continue;
    }

    const extra = extraChecks(parsed.data, history);
    if (extra.length > 0) {
      feedback = extra;
      console.log(`    attempt ${attempt}: ${extra[0]}`);
      continue;
    }

    const wrong = await factCheck(parsed.data);
    if (wrong.length > 0) {
      feedback = [...wrong, 'Replace any item you are not completely sure about.'];
      console.log(`    attempt ${attempt}: fact-check failed: ${wrong[0]}`);
      continue;
    }

    return parsed.data;
  }
  throw new Error(`no valid drop after ${MAX_ATTEMPTS} attempts (last: ${feedback[0] ?? '?'})`);
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  if (ONLY_DATE && !isRealDate(ONLY_DATE)) throw new Error(`--date must be YYYY-MM-DD`);
  const today = getZonedNow(schedule.timezone).date;
  const dates = ONLY_DATE ? [ONLY_DATE] : [today, addDays(today, 1)];
  const targets = categories.filter((c) => !ONLY_CATEGORY || c.id === ONLY_CATEGORY);
  if (targets.length === 0) throw new Error(`Unknown category "${ONLY_CATEGORY}"`);

  const sql = getSql();
  const existingRows = await sql`
    SELECT category, drop_date::text AS date, drop_no FROM drops
    WHERE drop_date = ANY(${dates}::date[])`;
  const existing = new Set(existingRows.map((r) => `${r.category}/${r.date}/${r.drop_no}`));

  console.log(
    `Learn5 generator · model ${GROQ_MODEL} · dates ${dates.join(', ')}${DRY_RUN ? ' · DRY RUN' : ''}`,
  );
  let made = 0;
  let skipped = 0;
  const failed: string[] = [];

  outer: for (const date of dates) {
    for (const category of targets) {
      for (let drop = 1; drop <= 3; drop++) {
        const key = `${category.id}/${date}/${drop}`;
        if (existing.has(key)) {
          skipped++;
          continue;
        }
        console.log(`• ${key}`);
        try {
          const result = await generateOne(category, date, drop);
          if (DRY_RUN) {
            console.log(JSON.stringify(result, null, 2));
          } else {
            await saveDrop(result, `groq:${GROQ_MODEL}`);
          }
          console.log(`  ✔ "${result.title}"`);
          made++;
        } catch (err) {
          if (err instanceof RateLimitExhaustedError) {
            console.error(`  ✖ ${err.message}. Stopping; the next run will continue.`);
            failed.push(`${key} (rate limit)`);
            break outer;
          }
          console.error(`  ✖ ${(err as Error).message}`);
          failed.push(key);
        }
      }
    }
  }

  console.log(`\nDone: ${made} new, ${skipped} already there, ${failed.length} failed.`);
  if (failed.length > 0) {
    console.error(`Failed: ${failed.join(', ')}`);
    process.exit(1); // the cron job shows a red ✖ so you notice
  }
}

main().catch((err: unknown) => {
  console.error('✖ Generator crashed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
