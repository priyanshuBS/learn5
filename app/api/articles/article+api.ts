/**
 * GET /api/articles/article?category=english&date=2026-11-12  →  one full article.
 * Returns 403 before it is published (04:00 in the content time zone).
 * An article never changes once written, so it is cached for a long time.
 */
import { getArticle } from '@/server/articles';

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  try {
    const result = await getArticle(params.get('category') ?? '', params.get('date') ?? '');
    if (result.status === 'not-published') {
      return Response.json(
        { error: 'This article is not out yet.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (result.status === 'not-found') {
      return Response.json(
        { error: 'Article not found.' },
        { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } },
      );
    }
    return Response.json(result.article, {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch (err) {
    console.error('[articles] article failed:', err);
    return Response.json({ error: 'Articles are not available right now.' }, { status: 503 });
  }
}
