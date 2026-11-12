/// <reference types="node" />
/**
 * alerts.ts — emails the owner when a Groq API key reaches its limit.
 *
 * Sent to ALERT_EMAIL with Resend (RESEND_API_KEY, EMAIL_FROM). At most ONE email
 * per key per day: the "alerts" table (scripts/sql/007_alerts.sql) remembers what
 * was already sent, so the 04:00 and 16:00 runs never send the same alert twice.
 * An alert that can't be sent is logged and never stops the generator.
 */
import { getZonedNow } from '../../src/lib/time';
import { getSql } from '../../src/server/db';
import { sendAlertEmail } from '../../src/server/email';

const TIMEZONE = 'Asia/Kolkata';

/** "groq-1" ran out (or was refused). `next` is the key we switch to (null = none left). */
export async function notifyKeyLimit(
  label: string,
  reason: string,
  next: string | null,
): Promise<void> {
  try {
    const to = process.env.ALERT_EMAIL?.trim();
    if (!to) {
      console.log('    … ALERT_EMAIL is not set, so no limit email was sent.');
      return;
    }
    const today = getZonedNow(TIMEZONE).date;
    if (process.env.DATABASE_URL) {
      const sql = getSql();
      const rows = await sql`
        INSERT INTO alerts (alert_key, sent_on)
        VALUES (${`groq-limit:${label}`}, ${today}::date)
        ON CONFLICT DO NOTHING
        RETURNING alert_key`;
      if (rows.length === 0) return; // already emailed about this key today
    }
    const subject = `Learn5: ${label} API key limit has been reached`;
    const text = [
      `For Learn5, the ${label} Groq API key limit has been reached.`,
      '',
      `Details: ${label} ${reason}.`,
      next
        ? `Learn5 has switched to the fallback key (${next}) and keeps generating.`
        : 'There is no other key left, so generating has stopped until the limit resets. The next scheduled run will continue.',
      '',
      `Time: ${new Date().toISOString()} (content day ${today}, ${TIMEZONE}).`,
    ].join('\n');
    await sendAlertEmail(to, subject, text);
    console.log(`    … emailed the limit alert for ${label}`);
  } catch (err) {
    console.error(`    … could not send the limit alert: ${(err as Error).message}`);
  }
}
