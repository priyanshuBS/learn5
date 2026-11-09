/**
 * sync.ts — keeps this device's progress and the user's account in step.
 *
 * When it syncs:
 *   - right after signing in, and when the app opens or comes back to the front,
 *   - as soon as there is something new (a finished drop, a fixed mistake, a report),
 *   - one last time before signing out.
 *
 * Offline? Nothing is lost: changes stay "pending" on the device and are sent
 * on the next successful sync. Only one sync runs at a time; requests that arrive
 * meanwhile are folded into one follow-up run.
 */
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { ApiError, apiRequest } from '../auth/api';
import { registerBeforeSignOut, useAuth } from '../auth/store';
import { dropKey } from '../drops/status';
import { hasPending, type Pending } from './merge';
import {
  SYNC_BATCH_LIMIT,
  SyncResponseSchema,
  type SyncRequest,
  type SyncResponse,
} from './schema';
import { useProgress } from './store';

/** In memory only: has this app session finished its first sync attempt? */
interface SyncStatus {
  firstAttemptDone: boolean;
  syncing: boolean;
  /** Last error message, if the last attempt failed (e.g. offline). */
  error: string | null;
}

export const useSyncStatus = create<SyncStatus>()(() => ({
  firstAttemptDone: false,
  syncing: false,
  error: null,
}));

let running: Promise<void> | null = null;
let runAgain = false;

/** Syncs now (or right after the sync that is already running). */
export function syncProgress(): Promise<void> {
  if (running) {
    runAgain = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        runAgain = false;
        await syncOnce();
      } while (runAgain);
    } finally {
      running = null;
    }
  })();
  return running;
}

async function syncOnce(): Promise<void> {
  const { status, token, user } = useAuth.getState();
  if (status !== 'signedIn' || !token || !user) return;
  if (!useProgress.persist.hasHydrated()) return; // runs again once loaded

  useProgress.getState().claim(user.id);
  const s = useProgress.getState();

  // Send at most one batch per round; if more is waiting, go round again.
  const sent: Pending = {
    results: s.pending.results.slice(0, SYNC_BATCH_LIMIT),
    fixed: s.pending.fixed.slice(0, SYNC_BATCH_LIMIT),
    reports: s.pending.reports.slice(0, SYNC_BATCH_LIMIT),
  };
  const body: SyncRequest = {
    since: s.cursor,
    results: sent.results.map((k) => s.results[k]).filter((r) => r !== undefined),
    fixedMistakes: Object.fromEntries(
      sent.fixed.filter((id) => s.fixedMistakes[id]).map((id) => [id, s.fixedMistakes[id]]),
    ),
    reports: sent.reports
      .map((id) => s.reports.find((r) => r.itemId === id))
      .filter((r) => r !== undefined),
  };

  useSyncStatus.setState({ syncing: true });
  try {
    const raw = await apiRequest<SyncResponse>(
      '/api/progress/sync',
      { method: 'POST', body: JSON.stringify(body) },
      token,
    );
    const reply = SyncResponseSchema.parse(raw);
    // Signed out or switched account while waiting? Then this reply is not for us.
    if (useAuth.getState().user?.id !== user.id) return;

    const results = Object.fromEntries(reply.results.map((r) => [dropKey(r), r]));
    useProgress
      .getState()
      .applySync(
        sent,
        { results, fixedMistakes: reply.fixedMistakes, reports: reply.reports },
        reply.cursor,
      );
    useSyncStatus.setState({ error: null });
    if (hasPending(useProgress.getState().pending)) runAgain = true;
  } catch (err) {
    useSyncStatus.setState({
      error: err instanceof Error ? err.message : 'Could not save your progress.',
    });
    // The server no longer accepts this sign-in: let the auth store decide (signs out on 401).
    if (err instanceof ApiError && err.status === 401) void useAuth.getState().revalidate();
  } finally {
    useSyncStatus.setState({ syncing: false, firstAttemptDone: true });
  }
}

/** Starts syncing. Use once, in the root layout. */
export function useProgressSync(): void {
  useEffect(() => {
    const kick = () => void syncProgress();

    // Signed in (or switched account) → sync.
    const unsubAuth = useAuth.subscribe((now, before) => {
      if (
        now.status === 'signedIn' &&
        (before.status !== 'signedIn' || now.user?.id !== before.user?.id)
      ) {
        kick();
      }
    });
    // Something new to send → sync.
    const unsubProgress = useProgress.subscribe((now, before) => {
      if (now.pending !== before.pending && hasPending(now.pending)) kick();
    });
    const unsubHydrated = useProgress.persist.onFinishHydration(kick);
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') kick();
    });
    // Before signing out: save what's left, then remove progress from this device.
    // (If it couldn't be saved — e.g. offline — it stays, and is sent when this user signs in again.)
    const unregister = registerBeforeSignOut(async () => {
      await syncProgress();
      if (!hasPending(useProgress.getState().pending)) useProgress.getState().clearAll();
    });

    kick();
    return () => {
      unsubAuth();
      unsubProgress();
      unsubHydrated();
      appState.remove();
      unregister();
    };
  }, []);
}
