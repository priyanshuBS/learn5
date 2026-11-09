/**
 * GET /api/content  →  the list of drops (same shape as content/index.json).
 * Cached for a minute, so millions of app opens cost very few database reads.
 */
import { getContentIndex } from '@/server/drops';

export async function GET(): Promise<Response> {
  try {
    return Response.json(await getContentIndex(), {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  } catch (err) {
    console.error('[content] index failed:', err);
    return Response.json({ error: 'Content is not available right now.' }, { status: 503 });
  }
}
