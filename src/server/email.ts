/**
 * email.ts — SERVER ONLY. Sends the sign-in code by email using Resend (https://resend.com).
 *
 * Without RESEND_API_KEY:
 *   - in development the code is printed in the "npx expo start" terminal,
 *   - in production sending fails, so nobody is told "code sent" when it wasn't.
 */
import { OTP_TTL_MINUTES } from '@/features/auth/rules';

export class EmailNotConfiguredError extends Error {}
/** The email provider refused or failed to send (details are logged, not shown to users). */
export class EmailSendError extends Error {}

const SEND_TIMEOUT_MS = 10_000;

const isProduction = process.env.NODE_ENV === 'production';

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || 'Learn5 <onboarding@resend.dev>';

  if (!apiKey) {
    if (isProduction) throw new EmailNotConfiguredError('RESEND_API_KEY is not set');
    console.log(
      `\n[Learn5 dev] Sign-in code for ${to}: ${code}  (set RESEND_API_KEY to email it)\n`,
    );
    return;
  }

  const text = [
    `Your Learn5 sign-in code is ${code}`,
    '',
    `It works for ${OTP_TTL_MINUTES} minutes. If you did not ask for it, you can ignore this email.`,
  ].join('\n');

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#16201E">
  <h2 style="margin:0 0 8px;color:#23302D">Learn5</h2>
  <p style="margin:0 0 16px">Your sign-in code is:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:0 0 16px">${code}</p>
  <p style="margin:0;color:#66716F;font-size:14px">It works for ${OTP_TTL_MINUTES} minutes.
  If you did not ask for it, you can ignore this email.</p>
</div>`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `${code} is your Learn5 code`, text, html }),
    });
  } catch (err) {
    throw new EmailSendError(`Could not reach Resend: ${(err as Error).message}`);
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new EmailSendError(`Resend error ${response.status}: ${detail.slice(0, 300)}`);
  }
}
