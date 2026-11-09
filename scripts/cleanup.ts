/// <reference types="node" />
/**
 * cleanup.ts — run with:  npm run cleanup   (the cron job runs it daily)
 *
 * Deletes data that is no longer needed, so the database stays small:
 *   - sign-in codes older than 1 day
 *   - sessions that ended more than 1 day ago
 */
import { neon } from '@neondatabase/serverless';

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const sql = neon(url);
  const codes =
    await sql`DELETE FROM otp_codes WHERE created_at < now() - interval '1 day' RETURNING 1`;
  const sessions =
    await sql`DELETE FROM sessions WHERE expires_at < now() - interval '1 day' RETURNING 1`;
  console.log(
    `✔ Removed ${codes.length} old sign-in code(s) and ${sessions.length} ended session(s).`,
  );
}

main().catch((err: unknown) => {
  console.error('✖ Clean-up failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
