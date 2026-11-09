/**
 * POST /api/auth/request-otp   { email }  →  { ok: true, resendAfterSec }
 * Emails a 6-digit sign-in code.
 */
import { z } from 'zod';

import { EmailSchema } from '@/features/auth/rules';
import { requestOtp } from '@/server/auth';
import { clientIp, handle, readBody } from '@/server/http';

const Body = z.object({ email: EmailSchema });

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const { email } = await readBody(request, Body);
    const { resendAfterSec } = await requestOtp(email, clientIp(request));
    return Response.json({ ok: true, resendAfterSec });
  });
}
