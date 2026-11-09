import { describe, expect, it } from '@jest/globals';

import { makeResult } from '@/test-utils/fixtures';

import { dropKey } from '../drops/status';
import {
  addPending,
  allPending,
  hasPending,
  mergeProgress,
  NO_PENDING,
  removeSent,
  type ProgressData,
} from '../progress/merge';
import { SYNC_BATCH_LIMIT, SyncRequestSchema } from '../progress/schema';

const data = (over: Partial<ProgressData> = {}): ProgressData => ({
  results: {},
  fixedMistakes: {},
  reports: [],
  ...over,
});

describe('mergeProgress', () => {
  it('adds results played on another device', () => {
    const mine = makeResult({ drop: 1 });
    const theirs = makeResult({ drop: 2 });
    const merged = mergeProgress(
      data({ results: { [dropKey(mine)]: mine } }),
      data({ results: { [dropKey(theirs)]: theirs } }),
    );
    expect(Object.keys(merged.results).sort()).toEqual([dropKey(mine), dropKey(theirs)].sort());
  });

  it('keeps the server version when both devices played the same drop (first play wins)', () => {
    const local = makeResult({ correct: [false, false, false, false, false] });
    const server = makeResult({ correct: [true, true, true, true, true] });
    const merged = mergeProgress(
      data({ results: { [dropKey(local)]: local } }),
      data({ results: { [dropKey(server)]: server } }),
    );
    expect(merged.results[dropKey(local)].items.every((i) => i.correct)).toBe(true);
  });

  it('keeps the earliest time for a fixed mistake', () => {
    const merged = mergeProgress(
      data({ fixedMistakes: { a: '2026-11-09T10:00:00.000Z', b: '2026-11-09T08:00:00.000Z' } }),
      data({ fixedMistakes: { a: '2026-11-09T09:00:00.000Z', b: '2026-11-09T09:00:00.000Z' } }),
    );
    expect(merged.fixedMistakes).toEqual({
      a: '2026-11-09T09:00:00.000Z',
      b: '2026-11-09T08:00:00.000Z',
    });
  });

  it('keeps one report per question', () => {
    const r = { itemId: 'x', dropKey: 'math/2026-11-08/1', reportedAt: '2026-11-09T10:00:00.000Z' };
    const merged = mergeProgress(
      data({ reports: [r] }),
      data({
        reports: [
          { ...r, reportedAt: '2026-11-09T11:00:00.000Z' },
          { ...r, itemId: 'y' },
        ],
      }),
    );
    expect(merged.reports.map((x) => x.itemId)).toEqual(['x', 'y']);
    expect(merged.reports[0].reportedAt).toBe('2026-11-09T10:00:00.000Z');
  });
});

describe('pending changes', () => {
  it('forgets only what was sent, keeping changes made during the sync', () => {
    const pending = { results: ['a', 'b', 'c'], fixed: ['f1'], reports: ['r1'] };
    const sent = { results: ['a', 'b'], fixed: ['f1'], reports: [] };
    expect(removeSent(pending, sent)).toEqual({ results: ['c'], fixed: [], reports: ['r1'] });
  });

  it('marks all existing device progress as pending when adopting it', () => {
    const r = makeResult();
    const pending = allPending(
      data({
        results: { [dropKey(r)]: r },
        fixedMistakes: { f: '2026-11-09T10:00:00.000Z' },
        reports: [
          { itemId: 'q', dropKey: 'x', reportedAt: '2026-11-09T10:00:00.000Z' },
          { itemId: 'q', dropKey: 'x', reportedAt: '2026-11-09T11:00:00.000Z' },
        ],
      }),
    );
    expect(pending).toEqual({ results: [dropKey(r)], fixed: ['f'], reports: ['q'] });
    expect(hasPending(pending)).toBe(true);
    expect(hasPending(NO_PENDING)).toBe(false);
  });

  it('does not add the same key twice', () => {
    expect(addPending(['a'], 'a')).toEqual(['a']);
    expect(addPending(['a'], 'b')).toEqual(['a', 'b']);
  });
});

describe('SyncRequestSchema', () => {
  const valid = {
    since: null,
    results: [makeResult({ completedAt: '2026-11-09T10:00:00.000Z' })],
    fixedMistakes: { 'math-2026-11-08-d1-01': '2026-11-09T10:00:00.000Z' },
    reports: [],
  };

  it('accepts a normal sync', () => {
    expect(SyncRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects broken results', () => {
    const bad = { ...valid, results: [{ ...valid.results[0], drop: 7 }] };
    expect(SyncRequestSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects batches that are too big', () => {
    const many = Array.from({ length: SYNC_BATCH_LIMIT + 1 }, (_, i) =>
      makeResult({ drop: 1, date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}` }),
    );
    expect(SyncRequestSchema.safeParse({ ...valid, results: many }).success).toBe(false);
  });
});
