/// <reference types="node" />
/**
 * seed-drops.ts — run with:  npm run seed-drops
 *
 * Copies the hand-written drops in content/ into the database (table "drops").
 * Drops already in the database are left as they are, so it is safe to run again.
 */
import { saveDrop } from '../src/server/drops';
import { loadContent, printProblems } from './lib/content-files';

async function main(): Promise<void> {
  const { drops, problems } = loadContent();
  if (problems.length > 0) {
    printProblems(problems);
    console.error('\n✖ Fix the content first ("npm run validate-content").');
    process.exit(1);
  }
  let added = 0;
  for (const { drop } of drops) {
    if (await saveDrop(drop, 'seed')) added++;
  }
  console.log(
    `✔ Seeded ${added} new drop(s); ${drops.length - added} were already in the database.`,
  );
}

main().catch((err: unknown) => {
  console.error('✖ Seeding failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
