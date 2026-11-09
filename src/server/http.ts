/**
 * http.ts — SERVER ONLY. Shared helpers for the API routes in app/api/.
 */
import type { z } from 'zod';

import { AuthError } from './auth';
import { EmailNotConfiguredError, EmailSendError } from './email';

/** Reads and checks a JSON body. Throws a 400 AuthError with a friendly message if it is wrong. */
export async function readBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AuthError(parsed.error.issues[0]?.message ?? 'Invalid request', 400);
  }
  return parsed.data;
}

/**
 * The visitor's IP address from the hosting proxy headers, or null if unknown
 * (e.g. local development). Used only for rate limits.
 */
export function clientIp(request: Request): string | null {
  const h = request.headers;
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = h.get('cf-connecting-ip') ?? forwarded ?? h.get('x-real-ip');
  return ip && ip.length <= 64 ? ip : null;
}

/** Runs a handler and turns errors into JSON: { error: "..." }. Never leaks server details. */
export async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof AuthError) {
      const headers: Record<string, string> = {};
      if (err.retryAfterSec) headers['Retry-After'] = String(err.retryAfterSec);
      return Response.json(
        { error: err.message, retryAfterSec: err.retryAfterSec },
        { status: err.status, headers },
      );
    }
    if (err instanceof EmailNotConfiguredError || err instanceof EmailSendError) {
      console.error('[auth] Email not sent:', err.message);
      return Response.json(
        { error: 'We could not send the email right now. Please try again in a minute.' },
        { status: 503 },
      );
    }
    console.error('[auth] Unexpected error:', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
