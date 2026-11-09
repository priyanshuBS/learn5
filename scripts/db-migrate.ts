/// <reference types="node" />
/**
 * db-migrate.ts — run with:  npm run db:migrate
 *
 * Creates the database tables in Neon (users, otp_codes, sessions) by running
 * every scripts/sql/*.sql file in name order. Safe to run again: the SQL only
 * creates what is missing. Reads DATABASE_URL from .env.local.
 */
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';

const SQL_DIR = path.join(__dirname, 'sql');

/** Splits a .sql file into statements (our files have no ";" inside strings). */
function statements(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('✖ DATABASE_URL is not set. Add it to .env.local.');
    process.exit(1);
  }
  const sql = neon(url);
  const files = fs
    .readdirSync(SQL_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    for (const statement of statements(fs.readFileSync(path.join(SQL_DIR, file), 'utf8'))) {
      await sql.query(statement);
    }
    console.log(`✔ Applied ${file}`);
  }
}

main().catch((err: unknown) => {
  console.error('✖ Migration failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
