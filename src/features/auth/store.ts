/**
 * auth store — who is signed in.
 *
 *   loading   → reading the saved session from the device (app start)
 *   signedOut → show the sign-in screen
 *   signedIn  → the app is open
 *
 * The session lasts 7 days from sign-in. It is saved on the device, so the
 * app opens straight away (even offline) until it ends. When online, the app
 * also asks the server if the session is still valid (e.g. not signed out).
 */
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { secureStorage } from '@/lib/secureStorage';

import { ApiError, authApi } from './api';
import type { AuthUser, SessionPayload } from './rules';

const SESSION_KEY = 'learn5.auth.session';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** ISO time when the session ends. */
  expiresAt: string | null;
  token: string | null;
  init: () => Promise<void>;
  /** Re-checks the session: ends it if expired or rejected by the server. */
  revalidate: () => Promise<void>;
  /** Emails a code. Returns seconds to wait before "Resend". Throws ApiError. */
  requestOtp: (email: string) => Promise<number>;
  /** Checks the code and signs in. Throws ApiError. */
  verifyOtp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Forgets the session on this device only (no server call, no before-sign-out work). */
  forgetSession: () => Promise<void>;
}

function isSession(value: unknown): value is SessionPayload {
  const v = value as SessionPayload | null;
  return (
    !!v &&
    typeof v.token === 'string' &&
    typeof v.expiresAt === 'string' &&
    typeof v.user?.id === 'string' &&
    typeof v.user?.email === 'string'
  );
}

const isExpired = (expiresAt: string | null) =>
  !expiresAt || !(new Date(expiresAt).getTime() > Date.now());

let initStarted = false;

/** Work to finish before signing out (e.g. saving progress). Each gets at most 5 seconds. */
const beforeSignOut = new Set<() => Promise<void>>();
const BEFORE_SIGN_OUT_TIMEOUT_MS = 5000;

/** Runs `task` before every sign-out. Returns a function that removes it. */
export function registerBeforeSignOut(task: () => Promise<void>): () => void {
  beforeSignOut.add(task);
  return () => beforeSignOut.delete(task);
}

export const useAuth = create<AuthState>()((set, get) => {
  const clear = async () => {
    await secureStorage.removeItem(SESSION_KEY);
    set({ status: 'signedOut', user: null, token: null, expiresAt: null });
  };

  return {
    status: 'loading',
    user: null,
    expiresAt: null,
    token: null,

    init: async () => {
      if (initStarted) return;
      initStarted = true;
      let saved: unknown = null;
      try {
        saved = JSON.parse((await secureStorage.getItem(SESSION_KEY)) ?? 'null');
      } catch {
        saved = null;
      }
      if (!isSession(saved) || isExpired(saved.expiresAt)) {
        await clear();
        return;
      }
      set({ status: 'signedIn', user: saved.user, token: saved.token, expiresAt: saved.expiresAt });
      void get().revalidate();
    },

    revalidate: async () => {
      const { token, expiresAt, status } = get();
      if (status !== 'signedIn' || !token) return;
      if (isExpired(expiresAt)) {
        await clear();
        return;
      }
      try {
        const session = await authApi.session(token);
        // The token may have been signed out meanwhile.
        if (get().token !== token) return;
        const next: SessionPayload = { token, expiresAt: session.expiresAt, user: session.user };
        await secureStorage.setItem(SESSION_KEY, JSON.stringify(next));
        set({ user: session.user, expiresAt: session.expiresAt });
      } catch (err) {
        // Only a clear "no" from the server signs you out; being offline does not.
        if (err instanceof ApiError && err.status === 401 && get().token === token) await clear();
      }
    },

    requestOtp: async (email) => {
      const { resendAfterSec } = await authApi.requestOtp(email);
      return resendAfterSec;
    },

    verifyOtp: async (email, code) => {
      const session = await authApi.verifyOtp(email, code);
      await secureStorage.setItem(SESSION_KEY, JSON.stringify(session));
      set({
        status: 'signedIn',
        user: session.user,
        token: session.token,
        expiresAt: session.expiresAt,
      });
    },

    forgetSession: clear,

    signOut: async () => {
      const { token } = get();
      await Promise.all(
        [...beforeSignOut].map((task) =>
          Promise.race([
            task().catch(() => {}),
            new Promise<void>((r) => setTimeout(r, BEFORE_SIGN_OUT_TIMEOUT_MS)),
          ]),
        ),
      );
      await clear();
      if (token) await authApi.logout(token).catch(() => {}); // best effort
    },
  };
});

/** Loads the saved session once, and re-checks it whenever the app comes back to the front. */
export function useAuthBootstrap(): void {
  useEffect(() => {
    void useAuth.getState().init();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void useAuth.getState().revalidate();
    });
    // Also end the session on time if the app stays open past its end.
    const timer = setInterval(() => {
      const { status, expiresAt } = useAuth.getState();
      if (status === 'signedIn' && isExpired(expiresAt)) void useAuth.getState().revalidate();
    }, 60_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);
}
