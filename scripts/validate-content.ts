/// <reference types="node" />
/**
 * validate-content.ts — run with:  npm run validate-content
 *
 * Checks ALL content before it can be published:
 *   - every drop file matches the schema (src/lib/schema.ts):
 *     exactly 5 items, 3 mcq + 1 true/false + 1 fill-blank/fact-card,
 *     2 easy + 2 medium + 1 hard, correct ids, file path matches contents
 *   - categories.json and schedule.config.json are valid
 *   - every category has 3 times, and no two tasks share a time
 *   - item ids are unique across ALL content
 *   - no duplicate question within 60 days (any category)
 *   - no repeated topic in the same category within 30 days
 *
 * Exit code 0 = all good, 1 = problems found (so scheduled tasks never push broken content).
 */
import { daysBetween } from '../src/lib/dates';
import type { Item } from '../src/lib/schema';
import {
  loadContent,
  printProblems,
  rel,
  SCHEDULE_FILE,
  type ContentProblem,
} from './lib/content-files';

const DUPLICATE_QUESTION_WINDOW_DAYS = 60;
const REPEATED_TOPIC_WINDOW_DAYS = 30;

/** Makes text comparable: lower-case, letters/numbers only, single spaces. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The main text of an item (fact cards have "fact" instead of "question"). */
function itemText(item: Item): string {
  return item.type === 'fact_card' ? item.fact : item.question;
}

function main(): void {
  const { categories, schedule, drops, problems } = loadContent();
  const extra: ContentProblem[] = [];

  // ── Schedule must cover exactly our categories, each with its own times ──
  if (schedule) {
    const scheduleFile = rel(SCHEDULE_FILE);
    const categoryIds = categories.map((c) => c.id);
    for (const id of categoryIds) {
      if (!schedule.drops[id])
        extra.push({ file: scheduleFile, message: `no times for category "${id}"` });
    }
    for (const id of Object.keys(schedule.drops)) {
      if (!categoryIds.includes(id))
        extra.push({ file: scheduleFile, message: `"${id}" is not in content/categories.json` });
    }
    // Different categories may share a time (every category opens at 04:00 and 16:00).
    for (const [id, times] of Object.entries(schedule.drops)) {
      if (new Set(times).size !== times.length)
        extra.push({ file: scheduleFile, message: `"${id}" has two drops at the same time` });
      const sorted = [...times].sort();
      if (sorted.join() !== times.join())
        extra.push({
          file: scheduleFile,
          message: `${id} times must go from earliest (drop 1) to latest (drop 3)`,
        });
    }
  }

  // ── Checks that compare items across files ──
  const seenIds = new Map<string, string>();
  type Seen = { date: string; category: string; file: string; text: string; topic: string };
  const seenItems: Seen[] = [];

  // Sort by date so "earlier" messages point at the older file.
  const sorted = [...drops].sort(
    (a, b) => a.drop.date.localeCompare(b.drop.date) || a.relPath.localeCompare(b.relPath),
  );

  for (const { relPath, drop } of sorted) {
    const file = `content/${relPath}`;
    for (const item of drop.items) {
      // Unique ids everywhere
      const otherFile = seenIds.get(item.id);
      if (otherFile) extra.push({ file, message: `id "${item.id}" is also used in ${otherFile}` });
      seenIds.set(item.id, file);

      const text = normalize(itemText(item));
      const topic = normalize(item.topic);
      for (const old of seenItems) {
        const gap = Math.abs(daysBetween(old.date, drop.date));
        if (gap <= DUPLICATE_QUESTION_WINDOW_DAYS && old.text === text) {
          extra.push({
            file,
            message: `${item.id}: same question as in ${old.file} (only ${gap} days apart; need more than ${DUPLICATE_QUESTION_WINDOW_DAYS})`,
          });
        }
        if (
          old.file !== file && // topics inside one drop are already checked by the schema
          old.category === drop.category &&
          gap <= REPEATED_TOPIC_WINDOW_DAYS &&
          old.topic === topic
        ) {
          extra.push({
            file,
            message: `${item.id}: topic "${item.topic}" was already used in ${old.file} (${gap} days apart; need more than ${REPEATED_TOPIC_WINDOW_DAYS})`,
          });
        }
      }
      seenItems.push({ date: drop.date, category: drop.category, file, text, topic });
    }
  }

  const all = [...problems, ...extra];
  if (all.length > 0) {
    printProblems(all);
    console.error(
      `\n✖ Found ${all.length} problem(s). Fix them, then run "npm run validate-content" again.\n`,
    );
    process.exit(1);
  }

  const days = new Set(drops.map((d) => d.drop.date)).size;
  console.log(
    `✔ Content is valid: ${drops.length} drop file(s), ${drops.length * 5} items, ${categories.length} categories, ${days} day(s).`,
  );
}

main();
