/**
 * rules.ts — sign-in rules shared by the app and the server (no secrets here).
 */
import { z } from 'zod';

/** Length of the one-time code sent by email. */
export const OTP_LENGTH = 6;
/** How long a code works after it is sent. */
export const OTP_TTL_MINUTES = 10;
/** Wrong guesses allowed per code before a new one is needed. */
export const OTP_MAX_ATTEMPTS = 5;
/** Wait this long before asking for another code. */
export const OTP_RESEND_SECONDS = 60;
/** At most this many codes per email per hour. */
export const OTP_MAX_PER_HOUR = 5;
/** At most this many codes per network (IP address) per hour, across all emails. */
export const OTP_MAX_PER_IP_PER_HOUR = 20;
/** You stay signed in for this many days, then sign in again. */
export const SESSION_DAYS = 7;

/** Trims and lower-cases an email so "  Asha@Mail.com " and "asha@mail.com" are the same person. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const EmailSchema = z
  .string()
  .transform(normalizeEmail)
  .pipe(z.email('Please enter a valid email address').max(254));

export const OtpCodeSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `The code has ${OTP_LENGTH} digits`);

/** The signed-in person, as the app sees it. */
export interface AuthUser {
  id: string;
  email: string;
}

/** What the server returns after a code is verified. */
export interface SessionPayload {
  token: string;
  /** ISO time when the session ends (7 days after sign-in). */
  expiresAt: string;
  user: AuthUser;
}
