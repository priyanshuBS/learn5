/**
 * POST /api/auth/verify-otp   { email, code }  →  { token, expiresAt, user }
 * Checks the code and starts a 7-day session.
 */
import { z } from 'zod';

import { EmailSchema, OtpCodeSchema } from '@/features/auth/rules';
import { verifyOtp } from '@/server/auth';
import { handle, readBody } from '@/server/http';

const Body = z.object({ email: EmailSchema, code: OtpCodeSchema });

export function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const { email, code } = await readBody(request, Body);
    return Response.json(await verifyOtp(email, code));
  });
}
