/**
 * GET /api/content/drop?path=english/2026-11-08/drop-2.json  →  the drop's 5 questions,
 * with answers and explanations. Returns 403 until the drop's opening time.
 * Higher tiers: path=english/2026-11-08/drop-2-t3.json.
 *
 * A drop never changes once written, so open drops are cached for a long time.
 * If the asked-for tier isn't written yet, a lower tier is served and cached
 * only briefly, so the real tier shows up once the generator has written it.
 */
import { dropForApp, getOpenDrop } from '@/server/drops';

export async function GET(request: Request): Promise<Response> {
  const path = new URL(request.url).searchParams.get('path') ?? '';
  try {
    const result = await getOpenDrop(path);
    if (result.status === 'not-open') {
      return Response.json(
        { error: 'This drop is not open yet.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (result.status === 'not-found') {
      return Response.json(
        { error: 'Drop not found.' },
        { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } },
      );
    }
    return Response.json(dropForApp(result.drop), {
      headers: {
        'Cache-Control': result.exact
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=300',
      },
    });
  } catch (err) {
    console.error('[content] drop failed:', err);
    return Response.json({ error: 'Content is not available right now.' }, { status: 503 });
  }
}
