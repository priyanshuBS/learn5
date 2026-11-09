/**
 * content.ts — gets learning content: from our API (the database), the device
 * cache, or the small offline set bundled in the app.
 *
 * How it works:
 *   - the list of drops (GET /api/content) is checked each time the app opens.
 *     If it changed, the new one is saved on the device.
 *   - A drop file is looked up in this order:
 *       memory → device cache → bundled in app → website (then cached).
 *   - Everything downloaded is checked with the Zod schema first, so broken
 *     content can never crash the app.
 *
 * New content appears WITHOUT a new app version: the daily generator saves it in
 * the database and the app reads it through the API.
 */
import { bundledDrops, bundledIndex } from '@/content/bundled.generated';
import { FETCH_TIMEOUT_MS } from '@/config';

import { apiUrl, canReachApi } from './apiUrl';

import { ContentIndexSchema, DropSchema, type ContentIndex, type Drop } from './schema';
import { storage } from './storage';

const INDEX_CACHE_KEY = 'learn5:content:index';
const DROP_CACHE_PREFIX = 'learn5:content:drop:';

/** Thrown when a drop is not on the device and cannot be downloaded. */
export class DropUnavailableError extends Error {
  constructor(path: string) {
    super(`Drop "${path}" is not available offline. Connect to the internet and try again.`);
    this.name = 'DropUnavailableError';
  }
}

/** True when the app can ask the API for live content. */
export const hasRemoteContent = canReachApi;

/** Downloads JSON, giving up after FETCH_TIMEOUT_MS. Returns null on any failure. */
async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null; // offline, timeout or bad JSON
  } finally {
    clearTimeout(timer);
  }
}

/** Parses saved JSON text safely. */
function parseJson(text: string | null): unknown | null {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** The index packed inside the app. */
export function getBundledIndex(): ContentIndex {
  return ContentIndexSchema.parse(bundledIndex);
}

/** The index saved on the device from an earlier download (or null). */
export async function getCachedIndex(): Promise<ContentIndex | null> {
  const parsed = ContentIndexSchema.safeParse(parseJson(await storage.getItem(INDEX_CACHE_KEY)));
  return parsed.success ? parsed.data : null;
}

/** Downloads the latest index from the website and caches it. Null if offline. */
export async function fetchRemoteIndex(): Promise<ContentIndex | null> {
  if (!hasRemoteContent) return null;
  const parsed = ContentIndexSchema.safeParse(await fetchJson(apiUrl('/api/content')));
  if (!parsed.success) return null;
  await storage.setItem(INDEX_CACHE_KEY, JSON.stringify(parsed.data));
  return parsed.data;
}

/** Picks the index with the newest content (used to compare cache vs bundled). */
export function newerIndex(a: ContentIndex, b: ContentIndex | null): ContentIndex {
  if (!b) return a;
  const dateA = a.latestDate ?? '';
  const dateB = b.latestDate ?? '';
  if (dateA !== dateB) return dateA > dateB ? a : b;
  return b.drops.length > a.drops.length ? b : a;
}

const memoryCache = new Map<string, Drop>();

/**
 * Downloads several drops and saves them on the device, so they open instantly
 * (and offline) later. Drops that can't be loaded right now are skipped quietly.
 * Returns how many are ready on the device.
 */
export async function prefetchDrops(paths: string[]): Promise<number> {
  const settled = await Promise.allSettled([...new Set(paths)].map((p) => loadDrop(p)));
  return settled.filter((s) => s.status === 'fulfilled').length;
}

/** Loads one drop file by its path inside content/, e.g. "math/2026-11-08/drop-1.json". */
export async function loadDrop(path: string): Promise<Drop> {
  const inMemory = memoryCache.get(path);
  if (inMemory) return inMemory;

  const remember = (drop: Drop) => {
    memoryCache.set(path, drop);
    return drop;
  };

  // 1. Saved on the device earlier
  const cached = DropSchema.safeParse(parseJson(await storage.getItem(DROP_CACHE_PREFIX + path)));
  if (cached.success) return remember(cached.data);

  // 2. Packed inside the app
  if (path in bundledDrops) {
    const bundled = DropSchema.safeParse(bundledDrops[path]);
    if (bundled.success) return remember(bundled.data);
  }

  // 3. Download from the website
  if (hasRemoteContent) {
    const remote = DropSchema.safeParse(
      await fetchJson(apiUrl(`/api/content/drop?path=${encodeURIComponent(path)}`)),
    );
    if (remote.success) {
      await storage.setItem(DROP_CACHE_PREFIX + path, JSON.stringify(remote.data));
      return remember(remote.data);
    }
  }

  throw new DropUnavailableError(path);
}
