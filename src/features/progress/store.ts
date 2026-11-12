/**
 * progress store — everything the user has done.
 *
 * The user's ACCOUNT (Neon database) is the real home of their progress.
 * This store is the fast local copy:
 *   - it is saved on the device too, so the app opens instantly and works offline,
 *   - every new result / fixed mistake / report is marked "pending" and sent to
 *     the server by sync.ts as soon as possible,
 *   - progress from other devices is merged in on every sync.
 *
 * `ownerId` says whose progress this is, so a different person signing in on the
 * same phone never sees (or inherits) someone else's progress.
 * Points, streaks and levels are all worked out from these saved results.
 */
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Difficulty, ItemType } from '@/lib/schema';
import { storage } from '@/lib/storage';

import { dropKey, type DropRef } from '../drops/status';
import {
  addPending,
  allPending,
  mergeProgress,
  NO_PENDING,
  removeSent,
  type Pending,
  type ProgressData,
} from './merge';

export interface ItemResult {
  itemId: string;
  type: ItemType;
  difficulty: Difficulty;
  correct: boolean;
  /** What the user picked or typed (for "review my mistakes" later). */
  given: string | null;
}

export interface DropResult extends DropRef {
  /** Question tier played, 1–3 (missing on older results = 1). */
  tier?: number;
  title: string;
  items: ItemResult[];
  correctCount: number;
  points: number;
  perfect: boolean;
  durationSec: number;
  /** ISO time when finished. */
  completedAt: string;
  /** The user's own calendar day when finished, "YYYY-MM-DD" (for streaks). */
  completedOn: string;
}

export interface WrongAnswerReport {
  itemId: string;
  dropKey: string;
  reportedAt: string;
}

interface ProgressState extends ProgressData {
  /** The user this progress belongs to (null = not linked to an account yet). */
  ownerId: string | null;
  /** Changes not yet saved on the server. */
  pending: Pending;
  /** From the last successful sync: ask the server only for newer changes. */
  cursor: string | null;
  /** ISO time of the last successful sync. */
  lastSyncedAt: string | null;

  /** Saves a result. Returns false if this drop was already played (replay = practice). */
  saveResult: (result: DropResult) => boolean;
  addReport: (report: WrongAnswerReport) => void;
  markMistakeFixed: (itemId: string) => void;

  /** Links progress to `userId`. Old unlinked progress is kept; another user's is cleared. */
  claim: (userId: string) => void;
  /** Merges a server reply and forgets the pending changes that were sent. */
  applySync: (sent: Pending, server: ProgressData, cursor: string) => void;
  /** Removes all progress from this device (after signing out). */
  clearAll: () => void;
}

const EMPTY: ProgressData = { results: {}, fixedMistakes: {}, reports: [] };
const EMPTY_SYNC = { ownerId: null, pending: NO_PENDING, cursor: null, lastSyncedAt: null };

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      ...EMPTY_SYNC,

      saveResult: (result) => {
        const key = dropKey(result);
        if (get().results[key]) return false;
        set((s) => ({
          results: { ...s.results, [key]: result },
          pending: { ...s.pending, results: addPending(s.pending.results, key) },
        }));
        return true;
      },

      addReport: (report) =>
        set((s) => ({
          reports: s.reports.some((r) => r.itemId === report.itemId)
            ? s.reports
            : [...s.reports, report],
          pending: { ...s.pending, reports: addPending(s.pending.reports, report.itemId) },
        })),

      markMistakeFixed: (itemId) =>
        set((s) => ({
          fixedMistakes: s.fixedMistakes[itemId]
            ? s.fixedMistakes
            : { ...s.fixedMistakes, [itemId]: new Date().toISOString() },
          pending: { ...s.pending, fixed: addPending(s.pending.fixed, itemId) },
        })),

      claim: (userId) => {
        const s = get();
        if (s.ownerId === userId) return;
        if (s.ownerId === null) {
          // Progress from before accounts existed (or before signing in): adopt it.
          set({ ownerId: userId, pending: allPending(s), cursor: null, lastSyncedAt: null });
        } else {
          // Someone else's progress: start clean, the server has theirs.
          set({ ...EMPTY, ...EMPTY_SYNC, ownerId: userId });
        }
      },

      applySync: (sent, server, cursor) =>
        set((s) => ({
          ...mergeProgress(s, server),
          pending: removeSent(s.pending, sent),
          cursor,
          lastSyncedAt: new Date().toISOString(),
        })),

      clearAll: () => set({ ...EMPTY, ...EMPTY_SYNC }),
    }),
    {
      name: 'learn5:progress',
      version: 2,
      storage: createJSONStorage(() => storage),
      // Version 1 had no account link: keep its progress and send all of it on first sync.
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<ProgressData>;
        if (version < 2) {
          const data: ProgressData = {
            results: old.results ?? {},
            fixedMistakes: old.fixedMistakes ?? {},
            reports: old.reports ?? [],
          };
          return { ...data, ...EMPTY_SYNC, pending: allPending(data) };
        }
        return persisted as ProgressState;
      },
      // Only save data, not functions.
      partialize: (s) => ({
        results: s.results,
        reports: s.reports,
        fixedMistakes: s.fixedMistakes,
        ownerId: s.ownerId,
        pending: s.pending,
        cursor: s.cursor,
        lastSyncedAt: s.lastSyncedAt,
      }),
    },
  ),
);

/** True once saved progress has been loaded from the device. */
export function useProgressHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useProgress.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useProgress.persist.onFinishHydration(() => setHydrated(true));
    // In case it finished between the first render and this effect:
    if (useProgress.persist.hasHydrated()) queueMicrotask(() => setHydrated(true));
    return unsubscribe;
  }, []);
  return hydrated;
}

/** The latest attempt, kept in memory only, so the results screen can show replays too. */
interface SessionState {
  lastAttempt: (DropResult & { practice: boolean }) | null;
  setLastAttempt: (attempt: (DropResult & { practice: boolean }) | null) => void;
}

export const useSession = create<SessionState>()((set) => ({
  lastAttempt: null,
  setLastAttempt: (lastAttempt) => set({ lastAttempt }),
}));
