/**
 * articles store — the daily article list for all screens, and which articles
 * you have read (saved on this device).
 *
 * On start: show the saved list straight away (works offline), then quietly
 * download the latest one. Re-checked when the app comes back to the front.
 */
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { articleKey, fetchArticleList, getCachedArticleList, loadArticle } from '@/lib/articles';
import type { Article, ArticleSummary } from '@/lib/schema';
import { storage } from '@/lib/storage';

interface ArticleListState {
  articles: ArticleSummary[] | null;
  /** True after the first download attempt (so screens can stop showing "loading"). */
  checked: boolean;
  refreshing: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
}

let initStarted = false;

export const useArticles = create<ArticleListState>()((set, get) => ({
  articles: null,
  checked: false,
  refreshing: false,

  init: async () => {
    if (initStarted) return;
    initStarted = true;
    const cached = await getCachedArticleList();
    if (cached) set({ articles: cached });
    await get().refresh();
  },

  refresh: async () => {
    if (get().refreshing) return;
    set({ refreshing: true });
    const remote = await fetchArticleList();
    set((s) => ({
      articles: remote ?? s.articles,
      refreshing: false,
      checked: true,
    }));
  },
}));

/** Starts loading the list once, and re-checks when the app comes back to the front. */
export function useArticlesBootstrap(): void {
  useEffect(() => {
    void useArticles.getState().init();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void useArticles.getState().refresh();
    });
    return () => sub.remove();
  }, []);
}

/** Which articles were read on this device: key → ISO time. */
interface ReadState {
  read: Record<string, string>;
  markRead: (ref: { category: string; date: string }) => void;
  /** Forgets all read marks (after signing out or deleting the account). */
  clearReads: () => void;
}

export const useArticleReads = create<ReadState>()(
  persist(
    (set) => ({
      read: {},
      markRead: (ref) =>
        set((s) => {
          const key = articleKey(ref);
          return s.read[key] ? s : { read: { ...s.read, [key]: new Date().toISOString() } };
        }),
      clearReads: () => set({ read: {} }),
    }),
    {
      name: 'learn5:articles:read',
      version: 1,
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ read: s.read }),
    },
  ),
);

type ArticleLoad =
  { status: 'loading' } | { status: 'ready'; article: Article } | { status: 'error' };

/** Loads one article. `retry()` tries again after an error. */
export function useArticle(
  ref: { category: string; date: string } | null,
): ArticleLoad & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; load: ArticleLoad } | null>(null);
  const refKey = ref ? articleKey(ref) : null;
  const key = `${refKey}#${attempt}`;

  useEffect(() => {
    if (!refKey) return;
    const [category, date] = refKey.split('/');
    let cancelled = false;
    loadArticle({ category, date })
      .then((article) => !cancelled && setResult({ key, load: { status: 'ready', article } }))
      .catch(() => !cancelled && setResult({ key, load: { status: 'error' } }));
    return () => {
      cancelled = true;
    };
  }, [refKey, key]);

  const load: ArticleLoad = result && result.key === key ? result.load : { status: 'loading' };
  return { ...load, retry: () => setAttempt((a) => a + 1) };
}
