/// <reference types="node" />
/**
 * alerts.ts — emails the owner (ALERT_EMAIL) when the content generators hit a problem:
 *   - the Groq API key reached its limit or was refused
 *   - some drops or articles could not be written
 *   - a generator crashed
 *
 * Sent with Resend (RESEND_API_KEY, EMAIL_FROM). The same alert is sent at most once
 * per run window (morning run / afternoon run, Asia/Kolkata): the "alerts" table
 * (scripts/sql/007_alerts.sql) remembers what was sent. An alert that can't be sent
 * is logged and never stops the generator.
 */
import { getZonedNow } from '../../src/lib/time';
import { getSql } from '../../src/server/db';
import { sendAlertEmail } from '../../src/server/email';

const TIMEZONE = 'Asia/Kolkata';

/**
 * Sends one alert email, unless the same alert (`key`) was already sent in this
 * run window today. `lines` is the plain-text body.
 */
export async function sendAlert(key: string, subject: string, lines: string[]): Promise<void> {
  try {
    const to = process.env.ALERT_EMAIL?.trim();
    if (!to) {
      console.log('    … ALERT_EMAIL is not set, so no alert email was sent.');
      return;
    }
    const now = getZonedNow(TIMEZONE);
    const window = now.minutes < 12 * 60 ? 'morning' : 'afternoon';
    if (process.env.DATABASE_URL) {
      const rows = await getSql()`
        INSERT INTO alerts (alert_key, sent_on)
        VALUES (${`${key}:${window}`}, ${now.date}::date)
        ON CONFLICT DO NOTHING
        RETURNING alert_key`;
      if (rows.length === 0) return; // already emailed about this in this run window
    }
    const text = [
      ...lines,
      '',
      `Time: ${new Date().toISOString()} (content day ${now.date}, ${window} run, ${TIMEZONE}).`,
      'Whatever was not written will be retried by the next scheduled run (04:00 / 16:00 IST).',
    ].join('\n');
    await sendAlertEmail(to, subject, text);
    console.log(`    … emailed alert: ${subject}`);
  } catch (err) {
    console.error(`    … could not send the alert email: ${(err as Error).message}`);
  }
}

/** The Groq key ran out (or was refused). `next` is the key we switch to (null = none left). */
export async function notifyKeyLimit(
  label: string,
  reason: string,
  next: string | null,
): Promise<void> {
  const refused = reason.startsWith('was refused');
  await sendAlert(
    `groq-${refused ? 'refused' : 'limit'}:${label}`,
    refused
      ? `Learn5: ${label} API key was refused`
      : `Learn5: ${label} API key limit has been reached`,
    [
      refused
        ? `For Learn5, the ${label} Groq API key was refused by Groq (it may be wrong, revoked or blocked).`
        : `For Learn5, the ${label} Groq API key limit has been reached.`,
      '',
      `Details: ${label} ${reason}.`,
      next
        ? `Learn5 has switched to the fallback key (${next}) and keeps generating.`
        : 'There is no other key, so generating has stopped for now.',
    ],
  );
}

/** A generator finished with some drops/articles not written. */
export async function notifyRunProblems(
  generator: 'drops' | 'articles',
  failed: string[],
  made: number,
): Promise<void> {
  await sendAlert(
    `${generator}-failed`,
    `Learn5: ${failed.length} ${generator === 'drops' ? 'drop(s)' : 'article(s)'} could not be written`,
    [
      `The Learn5 ${generator} generator finished with problems.`,
      `Written: ${made}. Not written: ${failed.length}.`,
      '',
      ...failed.map((f) => `- ${f}`),
    ],
  );
}

/** A generator crashed before finishing. */
export async function notifyCrash(generator: 'drops' | 'articles', message: string): Promise<void> {
  await sendAlert(`${generator}-crashed`, `Learn5: the ${generator} generator crashed`, [
    `The Learn5 ${generator} generator stopped with an error:`,
    '',
    message,
  ]);
}
