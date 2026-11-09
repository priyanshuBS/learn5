/**
 * auth.ts — SERVER ONLY. Email one-time-code sign-in and 7-day sessions.
 *
 *   1. requestOtp(email)      → makes a 6-digit code, saves its HASH, emails the code
 *   2. verifyOtp(email, code) → checks the code, creates the user if new,
 *                               returns a random session token (valid 7 days)
 *   3. getSessionUser(token)  → who is signed in with this token (or null)
 *   4. revokeSession(token)   → signs that device out
 *
 * The database never stores real codes or tokens, only hashes, so a leaked
 * database can't be used to sign in.
 */
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_PER_HOUR,
  OTP_MAX_PER_IP_PER_HOUR,
  OTP_RESEND_SECONDS,
  OTP_TTL_MINUTES,
  SESSION_DAYS,
  type AuthUser,
  type SessionPayload,
} from '@/features/auth/rules';

import { getSql } from './db';
import { sendOtpEmail } from './email';

/** A problem we explain to the user (shown in the app), with an HTTP status. */
export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfterSec?: number,
  ) {
    super(message);
  }
}

// ── Small crypto helpers (Web Crypto: works in Node and in edge hosting) ──

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error('AUTH_SECRET is missing or too short');
  return secret;
}

/** HMAC of the code with the server secret: a 6-digit code alone is too easy to guess from a hash. */
async function hashCode(email: string, code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(authSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(`${email}:${code}`)));
}

/** Compares two strings in constant time (no timing hints about how much matched). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Uniform random 6-digit code (rejection sampling avoids bias). */
function randomCode(): string {
  const max = 10 ** OTP_LENGTH;
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return String(buf[0] % max).padStart(OTP_LENGTH, '0');
}

function randomToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

// ── 1. Send a code ──

/**
 * @param ip the visitor's network address (null when unknown, e.g. local development).
 *           Limits how many codes one network can ask for, across all emails.
 */
export async function requestOtp(
  email: string,
  ip: string | null = null,
): Promise<{ resendAfterSec: number }> {
  const sql = getSql();

  if (ip) {
    const [byIp] = await sql`
      SELECT count(*)::int AS last_hour FROM otp_codes
      WHERE ip = ${ip} AND created_at > now() - interval '1 hour'`;
    if (byIp.last_hour >= OTP_MAX_PER_IP_PER_HOUR) {
      throw new AuthError(
        'Too many codes asked for from this network. Please try again later.',
        429,
        3600,
      );
    }
  }

  const [recent] = await sql`
    SELECT
      count(*)::int AS last_hour,
      COALESCE(EXTRACT(EPOCH FROM (now() - max(created_at))), 1e9)::int AS seconds_since_last
    FROM otp_codes
    WHERE email = ${email} AND created_at > now() - interval '1 hour'`;

  if (recent.seconds_since_last < OTP_RESEND_SECONDS) {
    const wait = OTP_RESEND_SECONDS - recent.seconds_since_last;
    throw new AuthError(`Please wait ${wait} seconds before asking for a new code.`, 429, wait);
  }
  if (recent.last_hour >= OTP_MAX_PER_HOUR) {
    throw new AuthError('Too many codes asked for. Please try again in an hour.', 429, 3600);
  }

  const code = randomCode();
  const [row] = await sql`
    INSERT INTO otp_codes (email, code_hash, expires_at, ip)
    VALUES (${email}, ${await hashCode(email, code)}, now() + make_interval(mins => ${OTP_TTL_MINUTES}), ${ip})
    RETURNING id`;

  try {
    await sendOtpEmail(email, code);
  } catch (err) {
    // Don't count a code the person never received against their limit.
    await sql`DELETE FROM otp_codes WHERE id = ${row.id}`;
    throw err;
  }

  // The email went out: older unused codes stop working now (only the newest one counts).
  await sql`
    UPDATE otp_codes SET consumed_at = now()
    WHERE email = ${email} AND consumed_at IS NULL AND id <> ${row.id}`;

  // Tidy up: codes older than a day are no longer needed.
  await sql`DELETE FROM otp_codes WHERE email = ${email} AND created_at < now() - interval '1 day'`;
  return { resendAfterSec: OTP_RESEND_SECONDS };
}

// ── 2. Check a code and start a session ──

export async function verifyOtp(email: string, code: string): Promise<SessionPayload> {
  const sql = getSql();

  const [otp] = await sql`
    SELECT id FROM otp_codes
    WHERE email = ${email} AND consumed_at IS NULL AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1`;
  if (!otp) {
    throw new AuthError(
      'This code has expired or was already used. Please ask for a new one.',
      400,
    );
  }

  // Count the attempt first (atomically), so guesses can't race past the limit.
  const [attempt] = await sql`
    UPDATE otp_codes SET attempts = attempts + 1
    WHERE id = ${otp.id} AND attempts < ${OTP_MAX_ATTEMPTS}
    RETURNING attempts, code_hash`;
  if (!attempt) {
    throw new AuthError('Too many wrong tries. Please ask for a new code.', 400);
  }

  if (!safeEqual(attempt.code_hash, await hashCode(email, code))) {
    const left = OTP_MAX_ATTEMPTS - attempt.attempts;
    throw new AuthError(
      left > 0
        ? `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.`
        : 'Too many wrong tries. Please ask for a new code.',
      400,
    );
  }

  // Use the code up (only one request can win this).
  const [consumed] = await sql`
    UPDATE otp_codes SET consumed_at = now()
    WHERE id = ${otp.id} AND consumed_at IS NULL
    RETURNING id`;
  if (!consumed) throw new AuthError('This code was already used. Please ask for a new one.', 400);

  const [user] = await sql`
    INSERT INTO users (email, last_login_at) VALUES (${email}, now())
    ON CONFLICT (email) DO UPDATE SET last_login_at = now()
    RETURNING id, email`;

  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await sql`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${await sha256(token)}, ${expiresAt})`;

  // Tidy up expired sessions of this user.
  await sql`DELETE FROM sessions WHERE user_id = ${user.id} AND expires_at < now()`;

  return { token, expiresAt, user: { id: user.id, email: user.email } };
}

// ── 3 & 4. Sessions ──

/** Reads "Authorization: Bearer <token>" from a request. */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+([A-Za-z0-9_-]{20,})$/.exec(header.trim());
  return match ? match[1] : null;
}

export async function getSessionUser(
  token: string,
): Promise<{ user: AuthUser; expiresAt: string } | null> {
  const sql = getSql();
  const [row] = await sql`
    UPDATE sessions s SET last_seen_at = now()
    FROM users u
    WHERE s.token_hash = ${await sha256(token)} AND s.expires_at > now() AND u.id = s.user_id
    RETURNING u.id, u.email, s.expires_at`;
  if (!row) return null;
  return {
    user: { id: row.id, email: row.email },
    expiresAt: new Date(row.expires_at).toISOString(),
  };
}

/** The signed-in user of a request, or a 401 error ("please sign in again"). */
export async function requireUser(request: Request): Promise<AuthUser> {
  const token = bearerToken(request);
  const session = token ? await getSessionUser(token) : null;
  if (!session) throw new AuthError('Please sign in again.', 401);
  return session.user;
}

export async function revokeSession(token: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM sessions WHERE token_hash = ${await sha256(token)}`;
}

/**
 * Deletes the account and EVERYTHING linked to it: sessions, results, fixed
 * mistakes and reports (the database removes those automatically with the user),
 * plus any sign-in codes sent to the email. This cannot be undone.
 */
export async function deleteAccount(user: AuthUser): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM users WHERE id = ${user.id}`;
  await sql`DELETE FROM otp_codes WHERE email = ${user.email}`;
}
