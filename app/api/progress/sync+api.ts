/**
 * POST /api/progress/sync   (Authorization: Bearer <token>)
 *   body:  { since, results, fixedMistakes, reports }   — new progress from this device
 *   reply: { results, fixedMistakes, reports, cursor }  — progress saved since `since`
 *
 * Saves the user's progress to their account and returns what other devices saved.
 */
import { SyncRequestSchema } from '@/features/progress/schema';
import { requireUser } from '@/server/auth';
import { handle, readBody } from '@/server/http';
import { syncProgress } from '@/server/progress';

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const user = await requireUser(request);
    const body = await readBody(request, SyncRequestSchema);
    return Response.json(await syncProgress(user.id, body));
  });
}
