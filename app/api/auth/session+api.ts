/**
 * GET /api/auth/session   (Authorization: Bearer <token>)  →  { user, expiresAt }  or 401
 * Tells the app whether its saved session is still valid.
 */
import { bearerToken, getSessionUser } from '@/server/auth';
import { handle } from '@/server/http';

export function GET(request: Request): Promise<Response> {
  return handle(async () => {
    const token = bearerToken(request);
    const session = token ? await getSessionUser(token) : null;
    if (!session) return Response.json({ error: 'Not signed in' }, { status: 401 });
    return Response.json(session);
  });
}
