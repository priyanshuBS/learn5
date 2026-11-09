/**
 * POST /api/account/delete   (Authorization: Bearer <token>)  →  { ok: true }
 * Permanently deletes the signed-in user's account and all their data.
 * (Required by the App Store and Google Play for apps that let people sign up.)
 */
import { deleteAccount, requireUser } from '@/server/auth';
import { handle } from '@/server/http';

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const user = await requireUser(request);
    await deleteAccount(user);
    return Response.json({ ok: true });
  });
}
