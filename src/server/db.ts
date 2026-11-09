/**
 * db.ts — SERVER ONLY. The Neon Postgres connection used by the API routes.
 *
 * Never import this from a screen or component: DATABASE_URL is a secret and
 * must stay on the server. Only files in app/api/ (+api.ts) may import it.
 */
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null = null;

/** The SQL tag: await sql`select ... where id = ${id}` (values are sent safely, never pasted in). */
export function getSql(): NeonQueryFunction<false, false> {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  client = neon(url);
  return client;
}
