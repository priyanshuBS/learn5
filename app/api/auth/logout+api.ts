/**
 * POST /api/auth/logout   (Authorization: Bearer <token>)  →  { ok: true }
 * Ends this device's session on the server.
 */
import { bearerToken, revokeSession } from '@/server/auth';
import { handle } from '@/server/http';

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const token = bearerToken(request);
    if (token) await revokeSession(token);
    return Response.json({ ok: true });
  });
}
