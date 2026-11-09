/**
 * config.ts — app settings from environment variables (.env.local in development,
 * the hosting / build environment in production).
 *
 * Only EXPO_PUBLIC_* variables can be read here: they are copied INTO the app,
 * so they must never be secrets. Server secrets (DATABASE_URL, AUTH_SECRET,
 * RESEND_API_KEY, EMAIL_FROM) are read only by the API routes in app/api/.
 *
 * Note: Expo copies these in only when written exactly as process.env.EXPO_PUBLIC_NAME.
 *
 *   EXPO_PUBLIC_APP_URL      the live website, which also runs the API (sign-in,
 *                            progress, content). Phone builds send /api requests here.
 *   EXPO_PUBLIC_REPORT_EMAIL where "Report wrong answer" emails go.
 */
const clean = (value: string | undefined) => (value ?? '').trim().replace(/\/+$/, '');

/** Live website + API address, without a trailing slash. */
export const APP_URL = clean(process.env.EXPO_PUBLIC_APP_URL);

export const REPORT_EMAIL = (process.env.EXPO_PUBLIC_REPORT_EMAIL ?? '').trim();

/** How long to wait for the internet before giving up and using saved content. */
export const FETCH_TIMEOUT_MS = 8000;
