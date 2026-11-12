/**
 * GET /api/articles  →  recent published articles (title, summary, reading time), newest first.
 * Cached for a minute.
 */
import { listArticles } from '@/server/articles';

export async function GET(): Promise<Response> {
  try {
    return Response.json(
      { articles: await listArticles() },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } },
    );
  } catch (err) {
    console.error('[articles] list failed:', err);
    return Response.json({ error: 'Articles are not available right now.' }, { status: 503 });
  }
}
