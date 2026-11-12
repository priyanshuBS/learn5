/**
 * useAppData — one hook that gives screens everything they usually need:
 * content index, "now" in the content time zone, progress and stats.
 */
import { useMemo } from 'react';

import { useAuth } from '@/features/auth/store';
import { useContent } from '@/features/content/store';
import { dropKey, type DropRef } from '@/features/drops/status';
import { useProgress, useProgressHydrated } from '@/features/progress/store';
import { useSyncStatus } from '@/features/progress/sync';
import { getMistakes } from '@/features/review/mistakes';
import { computeStats } from '@/features/stats';
import { todayLocal } from '@/lib/dates';
import { getZonedNow } from '@/lib/time';

import { useIsClient, useNow } from './useClient';

export function useAppData() {
  const isClient = useIsClient();
  const hydrated = useProgressHydrated();
  const index = useContent((s) => s.index);
  const results = useProgress((s) => s.results);
  const fixedMistakes = useProgress((s) => s.fixedMistakes);
  const now = useNow();
  // On a device that has never synced this account (e.g. a new phone), wait for the
  // first sync so the user sees their real progress, not an empty start.
  const userId = useAuth((s) => s.user?.id ?? null);
  const neverSynced = useProgress((s) => s.cursor === null || s.ownerId !== userId);
  const firstSyncDone = useSyncStatus((s) => s.firstAttemptDone);
  const waitingForAccount = userId !== null && neverSynced && !firstSyncDone;

  const zonedNow = useMemo(
    () => getZonedNow(index?.timezone ?? 'Asia/Kolkata', now),
    [index?.timezone, now],
  );

  const today = todayLocal(now);
  const categoryCount = index?.categories.length ?? 0;
  const stats = useMemo(
    () => computeStats(results, categoryCount, today),
    [results, categoryCount, today],
  );

  const mistakes = useMemo(() => getMistakes(results, fixedMistakes), [results, fixedMistakes]);

  const isDone = (ref: DropRef) => Boolean(results[dropKey(ref)]);

  return {
    /** True when everything is loaded and safe to show (not during website pre-render). */
    ready: isClient && hydrated && index !== null && !waitingForAccount,
    index,
    results,
    fixedMistakes,
    mistakes,
    zonedNow,
    now,
    today,
    stats,
    isDone,
  };
}
