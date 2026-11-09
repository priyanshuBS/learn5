/**
 * api.ts — the app's calls to our API (sign-in here; progress sync uses apiRequest too).
 * Where requests go: see src/lib/apiUrl.ts.
 */
import { apiUrl } from '@/lib/apiUrl';

import type { AuthUser, SessionPayload } from './rules';

const TIMEOUT_MS = 15_000;

/** An error with a message that is safe to show to the user. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfterSec?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Calls one of our API routes. Throws ApiError with a message safe to show. */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new ApiError("Can't reach Learn5. Check your internet connection and try again.", 0);
  } finally {
    clearTimeout(timer);
  }
  const data = (await response.json().catch(() => null)) as
    (T & { error?: string; retryAfterSec?: number }) | null;
  if (!response.ok) {
    throw new ApiError(
      data?.error ?? 'Something went wrong. Please try again.',
      response.status,
      data?.retryAfterSec,
    );
  }
  return data as T;
}

export const authApi = {
  requestOtp: (email: string) =>
    apiRequest<{ ok: true; resendAfterSec: number }>('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyOtp: (email: string, code: string) =>
    apiRequest<SessionPayload>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  session: (token: string) =>
    apiRequest<{ user: AuthUser; expiresAt: string }>('/api/auth/session', {}, token),
  logout: (token: string) =>
    apiRequest<{ ok: true }>('/api/auth/logout', { method: 'POST' }, token),
  deleteAccount: (token: string) =>
    apiRequest<{ ok: true }>('/api/account/delete', { method: 'POST' }, token),
};
