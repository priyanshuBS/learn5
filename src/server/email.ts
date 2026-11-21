/**
 * email.ts — SERVER ONLY. Sends Learn5 emails with Resend (https://resend.com):
 *   - the sign-in code (sendOtpEmail)
 *   - owner alerts from the content jobs (sendAlertEmail)
 * Both use one layout (renderEmail) that matches the app: indigo accent, serif headings.
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

// ── One email layout for every Learn5 email (matches the app: indigo accent, serif headings) ──

const INDIGO = '#4338CA';
const INK = '#171630';
const MUTED = '#6E6C8C';
const LINE = '#ECEBF3';
const PAGE = '#F6F6FB';
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace";

/** Escapes text for safe use inside the HTML email. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Wraps content in the Learn5 email layout: a logo row, a serif heading, the body
 * and a quiet footer. Tables and inline styles only, so it looks right in every
 * email app (Gmail, Outlook, Apple Mail).
 */
export function renderEmail({
  preheader,
  heading,
  body,
  footer,
}: {
  /** Hidden preview line shown in the inbox list. */
  preheader: string;
  heading: string;
  /** Trusted HTML (escape any user or AI text with escapeHtml first). */
  body: string;
  footer: string;
}): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};">
<tr><td align="center" style="padding:40px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
    <tr><td style="padding:0 4px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:28px;height:28px;background:${INDIGO};border-radius:8px;text-align:center;vertical-align:middle;font-family:${SANS};font-size:15px;font-weight:700;color:#FFFFFF;">5</td>
        <td style="padding-left:10px;font-family:${SERIF};font-size:20px;color:${INK};">Learn5</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#FFFFFF;border:1px solid ${LINE};border-radius:16px;padding:32px 28px;">
      <h1 style="margin:0 0 12px;font-family:${SERIF};font-weight:400;font-size:28px;line-height:34px;color:${INK};">${escapeHtml(heading)}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:20px 4px 0;font-family:${SANS};font-size:12px;line-height:18px;color:${MUTED};">${footer}</td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

/** A paragraph in the email body. */
export function emailParagraph(html: string, muted = false): string {
  return `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:24px;color:${muted ? MUTED : INK};">${html}</p>`;
}

/** The 6-digit code, large and spaced, in a soft indigo box. */
function codeBlock(code: string): string {
  return `<div style="margin:8px 0 24px;padding:20px 0;background:#EFEEFD;border-radius:12px;text-align:center;font-family:${MONO};font-size:34px;font-weight:700;letter-spacing:10px;color:${INDIGO};">${escapeHtml(code)}</div>`;
}

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

  const html = renderEmail({
    preheader: `${code} is your Learn5 sign-in code`,
    heading: 'Your sign-in code',
    body:
      emailParagraph('Enter this code in Learn5 to sign in:') +
      codeBlock(code) +
      emailParagraph(
        `It works for ${OTP_TTL_MINUTES} minutes. If you did not ask for it, you can ignore this email.`,
        true,
      ),
    footer:
      'Learn5 · Learn a little, every day.<br>You got this email because someone entered this address on Learn5.',
  });

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

/**
 * An alert for the app's owner (e.g. "groq-1 API key limit has been reached"), sent as
 * plain text plus the same text in the Learn5 email layout.
 * Needs RESEND_API_KEY; throws EmailNotConfiguredError without it.
 */
export async function sendAlertEmail(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || 'Learn5 <onboarding@resend.dev>';
  if (!apiKey) throw new EmailNotConfiguredError('RESEND_API_KEY is not set');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, html: alertHtml(subject, text) }),
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

/** The alert text in the email layout: the first line as the heading, the rest as paragraphs and lists. */
function alertHtml(subject: string, text: string): string {
  const blocks = text.split(/\n\s*\n/).map((block) => {
    const lines = block.split('\n').filter((l) => l.trim());
    if (lines.length > 0 && lines.every((l) => l.startsWith('- '))) {
      return `<ul style="margin:0 0 16px;padding-left:20px;font-family:${SANS};font-size:14px;line-height:22px;color:${INK};">${lines
        .map((l) => `<li>${escapeHtml(l.slice(2))}</li>`)
        .join('')}</ul>`;
    }
    return emailParagraph(lines.map(escapeHtml).join('<br>'));
  });
  return renderEmail({
    preheader: subject,
    heading: subject.replace(/^Learn5:\s*/, ''),
    body: blocks.join(''),
    footer: 'Learn5 content alerts · sent to ALERT_EMAIL by the daily content jobs.',
  });
}
