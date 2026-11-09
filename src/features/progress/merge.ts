/**
 * merge.ts — combines progress on this device with progress from the server.
 * Pure functions (no storage, no network), so they are easy to test.
 *
 * Rules:
 *   - results:        the server wins. It keeps the FIRST play of each drop,
 *                     even if it was played on another device.
 *   - fixed mistakes: keep the earliest time either side saw.
 *   - reports:        one per question; keep whichever we already have.
 */
import { dropKey } from '../drops/status';
import type { DropResult, WrongAnswerReport } from './store';

export interface ProgressData {
  results: Record<string, DropResult>;
  fixedMistakes: Record<string, string>;
  reports: WrongAnswerReport[];
}

/** What is waiting to be sent to the server (keys only). */
export interface Pending {
  /** dropKey() of results not yet saved on the server. */
  results: string[];
  /** itemIds of fixed mistakes not yet saved. */
  fixed: string[];
  /** itemIds of reports not yet saved. */
  reports: string[];
}

export const NO_PENDING: Pending = { results: [], fixed: [], reports: [] };

export function hasPending(p: Pending): boolean {
  return p.results.length > 0 || p.fixed.length > 0 || p.reports.length > 0;
}

/** Everything in `data` marked as waiting to be sent (used when adopting old device data). */
export function allPending(data: ProgressData): Pending {
  return {
    results: Object.keys(data.results),
    fixed: Object.keys(data.fixedMistakes),
    reports: [...new Set(data.reports.map((r) => r.itemId))],
  };
}

/** Merges server data into local data. */
export function mergeProgress(local: ProgressData, server: ProgressData): ProgressData {
  const results = { ...local.results };
  for (const r of Object.values(server.results)) results[dropKey(r)] = r;

  const fixedMistakes = { ...local.fixedMistakes };
  for (const [itemId, at] of Object.entries(server.fixedMistakes)) {
    const mine = fixedMistakes[itemId];
    if (!mine || at < mine) fixedMistakes[itemId] = at;
  }

  const reports = [...local.reports];
  const reported = new Set(reports.map((r) => r.itemId));
  for (const r of server.reports) {
    if (!reported.has(r.itemId)) {
      reports.push(r);
      reported.add(r.itemId);
    }
  }

  return { results, fixedMistakes, reports };
}

/** Removes the keys that were just saved on the server. Keeps anything added meanwhile. */
export function removeSent(pending: Pending, sent: Pending): Pending {
  const without = (list: string[], gone: string[]) => {
    const g = new Set(gone);
    return list.filter((k) => !g.has(k));
  };
  return {
    results: without(pending.results, sent.results),
    fixed: without(pending.fixed, sent.fixed),
    reports: without(pending.reports, sent.reports),
  };
}

/** Adds a key to a pending list (no duplicates). */
export function addPending(list: string[], key: string): string[] {
  return list.includes(key) ? list : [...list, key];
}
