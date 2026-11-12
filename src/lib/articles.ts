/**
 * articles.ts — gets the daily articles from our API, with a copy on the device
 * so articles you opened (and the last list) still work offline.
 *
 *   list:    GET /api/articles                          (refreshed each time the app opens)
 *   article: GET /api/articles/article?category=…&date=… (memory → device → website)
 *
 * Everything downloaded is checked with the Zod schema first.
 */
import { FETCH_TIMEOUT_MS } from '@/config';

import { apiUrl, canReachApi } from './apiUrl';
import { ArticleIndexSchema, ArticleSchema, type Article, type ArticleSummary } from './schema';
import { storage } from './storage';

const LIST_CACHE_KEY = 'learn5:articles:list';
const ARTICLE_CACHE_PREFIX = 'learn5:articles:article:';

export class ArticleUnavailableError extends Error {
  constructor() {
    super('This article is not saved on this device yet. Connect to the internet and try again.');
    this.name = 'ArticleUnavailableError';
  }
}

/** "english/2026-11-12" — one article per category per day. */
export function articleKey(ref: { category: string; date: string }): string {
  return `${ref.category}/${ref.date}`;
}

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseJson(text: string | null): unknown | null {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** The article list saved on the device from the last download (or null). */
export async function getCachedArticleList(): Promise<ArticleSummary[] | null> {
  const parsed = ArticleIndexSchema.safeParse(parseJson(await storage.getItem(LIST_CACHE_KEY)));
  return parsed.success ? parsed.data.articles : null;
}

/** Downloads the latest article list and saves it on the device. Null if offline. */
export async function fetchArticleList(): Promise<ArticleSummary[] | null> {
  if (!canReachApi) return null;
  const parsed = ArticleIndexSchema.safeParse(await fetchJson(apiUrl('/api/articles')));
  if (!parsed.success) return null;
  await storage.setItem(LIST_CACHE_KEY, JSON.stringify(parsed.data));
  return parsed.data.articles;
}

const memoryCache = new Map<string, Article>();

/** Loads one full article. */
export async function loadArticle(ref: { category: string; date: string }): Promise<Article> {
  const key = articleKey(ref);
  const inMemory = memoryCache.get(key);
  if (inMemory) return inMemory;

  const cached = ArticleSchema.safeParse(
    parseJson(await storage.getItem(ARTICLE_CACHE_PREFIX + key)),
  );
  if (cached.success) {
    memoryCache.set(key, cached.data);
    return cached.data;
  }

  if (canReachApi) {
    const query = `category=${encodeURIComponent(ref.category)}&date=${encodeURIComponent(ref.date)}`;
    const remote = ArticleSchema.safeParse(
      await fetchJson(apiUrl(`/api/articles/article?${query}`)),
    );
    if (remote.success) {
      await storage.setItem(ARTICLE_CACHE_PREFIX + key, JSON.stringify(remote.data));
      memoryCache.set(key, remote.data);
      return remote.data;
    }
  }
  throw new ArticleUnavailableError();
}
