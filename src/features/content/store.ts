/**
 * content store — the list of available drops (content/index.json) for all screens.
 *
 * On start: show saved or bundled content immediately (works offline), then
 * quietly check the website for newer content and swap it in.
 */
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { create } from 'zustand';

import {
  fetchRemoteIndex,
  getBundledIndex,
  getCachedIndex,
  loadDrop,
  newerIndex,
  prefetchDrops,
} from '@/lib/content';
import type { ContentIndex, Drop } from '@/lib/schema';

interface ContentState {
  index: ContentIndex | null;
  /** Where the current index came from. */
  source: 'bundled' | 'cache' | 'remote' | null;
  refreshing: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
}

let initStarted = false;

export const useContent = create<ContentState>()((set, get) => ({
  index: null,
  source: null,
  refreshing: false,

  init: async () => {
    if (initStarted) return;
    initStarted = true;
    const bundled = getBundledIndex();
    const cached = await getCachedIndex();
    const best = newerIndex(bundled, cached);
    set({ index: best, source: best === bundled ? 'bundled' : 'cache' });
    await get().refresh();
  },

  refresh: async () => {
    if (get().refreshing) return;
    set({ refreshing: true });
    const remote = await fetchRemoteIndex();
    if (remote && remote.version !== get().index?.version) {
      set({ index: remote, source: 'remote' });
    }
    set({ refreshing: false });
  },
}));

/** Starts loading content once, and re-checks the website when the app comes back to the front. */
export function useContentBootstrap(): void {
  useEffect(() => {
    void useContent.getState().init();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void useContent.getState().refresh();
    });
    return () => sub.remove();
  }, []);
}

type DropLoad =
  { status: 'loading' } | { status: 'ready'; drop: Drop } | { status: 'error'; message: string };

/** Loads one drop file (by its path in content/). `retry()` tries again after an error. */
export function useDropFile(path: string | null): DropLoad & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  // We remember which path+attempt the result belongs to, so a new path shows "loading".
  const [result, setResult] = useState<{ key: string; load: DropLoad } | null>(null);
  const key = `${path}#${attempt}`;

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    loadDrop(path)
      .then((drop) => !cancelled && setResult({ key, load: { status: 'ready', drop } }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Could not load this drop.';
        if (!cancelled) setResult({ key, load: { status: 'error', message } });
      });
    return () => {
      cancelled = true;
    };
  }, [path, key]);

  const load: DropLoad = result && result.key === key ? result.load : { status: 'loading' };
  return { ...load, retry: () => setAttempt((a) => a + 1) };
}

/**
 * Downloads drops in the background and saves them on the device (e.g. all of
 * today's open drops when a category page opens), so "Start" is instant.
 */
export function usePrefetchDrops(paths: string[]): void {
  const key = [...new Set(paths)].sort().join('|');
  useEffect(() => {
    if (key) void prefetchDrops(key.split('|'));
  }, [key]);
}

/**
 * Loads several drop files at once (for Review and Flashcards).
 * Drops that can't be loaded (e.g. offline) are skipped and counted in `failed`.
 */
export function useDropFiles(paths: string[]): {
  loading: boolean;
  drops: Record<string, Drop>;
  failed: number;
} {
  const key = [...new Set(paths)].sort().join('|');
  const [result, setResult] = useState<{
    key: string;
    drops: Record<string, Drop>;
    failed: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const list = key ? key.split('|') : [];
    Promise.allSettled(list.map((p) => loadDrop(p))).then((settled) => {
      if (cancelled) return;
      const drops: Record<string, Drop> = {};
      let failed = 0;
      settled.forEach((s, i) => {
        if (s.status === 'fulfilled') drops[list[i]] = s.value;
        else failed++;
      });
      setResult({ key, drops, failed });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!result || result.key !== key) return { loading: true, drops: {}, failed: 0 };
  return { loading: false, drops: result.drops, failed: result.failed };
}
