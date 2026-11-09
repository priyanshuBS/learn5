/// <reference types="node" />
/**
 * build-index.ts — run with:  npm run build-index
 *
 * Re-creates content/index.json: one list of every available drop, plus the
 * categories and the drop times. The app downloads this small file first to
 * learn what content exists, then downloads only the drops it needs.
 *
 * Never edit content/index.json by hand — just run this script.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';

import { ContentIndexSchema, type ContentIndex } from '../src/lib/schema';
import { INDEX_FILE, loadContent, printProblems, rel } from './lib/content-files';

function main(): void {
  const { categories, schedule, drops, problems } = loadContent();

  if (problems.length > 0 || !schedule) {
    printProblems(problems);
    console.error(
      '\n✖ Cannot build the index while content has problems. Run "npm run validate-content".\n',
    );
    process.exit(1);
  }

  // Stable order: date, then category order from categories.json, then drop number.
  const categoryOrder = new Map(categories.map((c, i) => [c.id, i]));
  const sorted = [...drops].sort(
    (a, b) =>
      a.drop.date.localeCompare(b.drop.date) ||
      (categoryOrder.get(a.drop.category) ?? 0) - (categoryOrder.get(b.drop.category) ?? 0) ||
      a.drop.drop - b.drop.drop,
  );

  const entries = sorted.map(({ relPath, drop }) => ({
    category: drop.category,
    date: drop.date,
    drop: drop.drop,
    title: drop.title,
    path: relPath,
  }));

  // "version" is a fingerprint of all content. Same content => same version,
  // so re-running this script without changes does not create a new git diff.
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify({ categories, schedule }));
  for (const { drop } of sorted) hash.update(JSON.stringify(drop));
  const version = hash.digest('hex').slice(0, 12);

  const index: ContentIndex = {
    version,
    latestDate: entries.length > 0 ? entries[entries.length - 1].date : null,
    timezone: schedule.timezone,
    schedule: schedule.drops,
    categories,
    drops: entries,
  };

  // Double-check our own output against the schema before saving it.
  ContentIndexSchema.parse(index);

  const json = JSON.stringify(index, null, 2) + '\n';
  const previous = fs.existsSync(INDEX_FILE) ? fs.readFileSync(INDEX_FILE, 'utf8') : '';
  if (previous === json) {
    console.log(
      `✔ ${rel(INDEX_FILE)} is already up to date (${entries.length} drops, version ${version}).`,
    );
    return;
  }
  fs.writeFileSync(INDEX_FILE, json, 'utf8');
  console.log(
    `✔ Wrote ${rel(INDEX_FILE)}: ${entries.length} drops, latest ${index.latestDate}, version ${version}.`,
  );
}

main();
