/**
 * Small helpers to build fake data for tests.
 */
import type { DropResult, ItemResult } from '@/features/progress/store';
import type { ContentIndex, Difficulty, ItemType } from '@/lib/schema';

const MIX: { type: ItemType; difficulty: Difficulty }[] = [
  { type: 'mcq', difficulty: 'easy' },
  { type: 'true_false', difficulty: 'easy' },
  { type: 'mcq', difficulty: 'medium' },
  { type: 'fact_card', difficulty: 'medium' },
  { type: 'mcq', difficulty: 'hard' },
];

/** A fake finished drop. `correct` lists which of the 5 items were right. */
export function makeResult(
  opts: {
    category?: string;
    date?: string;
    drop?: number;
    completedOn?: string;
    completedAt?: string;
    correct?: boolean[];
    points?: number;
  } = {},
): DropResult {
  const category = opts.category ?? 'math';
  const date = opts.date ?? '2026-11-08';
  const drop = opts.drop ?? 1;
  const correct = opts.correct ?? [true, true, true, true, true];
  const items: ItemResult[] = MIX.map((m, i) => ({
    itemId: `${category}-${date}-d${drop}-0${i + 1}`,
    type: m.type,
    difficulty: m.difficulty,
    correct: correct[i],
    given: correct[i] ? 'right' : 'wrong',
  }));
  return {
    category,
    date,
    drop,
    title: 'Test drop',
    items,
    correctCount: correct.filter(Boolean).length,
    points: opts.points ?? 100,
    perfect: correct.every(Boolean),
    durationSec: 120,
    completedAt: opts.completedAt ?? `${opts.completedOn ?? date}T10:00:00.000Z`,
    completedOn: opts.completedOn ?? date,
  };
}

/** Turns a list of results into the { key: result } shape the store uses. */
export function byKey(results: DropResult[]): Record<string, DropResult> {
  return Object.fromEntries(results.map((r) => [`${r.category}/${r.date}/${r.drop}`, r]));
}

/** A tiny content index: 2 categories, times 07:00 / 13:00 / 19:00. */
export function makeIndex(drops: { category: string; date: string; drop: number }[]): ContentIndex {
  return {
    version: 'test',
    latestDate:
      drops
        .map((d) => d.date)
        .sort()
        .at(-1) ?? null,
    timezone: 'Asia/Kolkata',
    schedule: {
      math: ['07:00', '13:00', '19:00'],
      english: ['07:30', '13:30', '19:30'],
    },
    categories: [
      { id: 'math', name: 'Math', emoji: '🧮', color: '#3B82F6', tagline: 'Numbers' },
      { id: 'english', name: 'English', emoji: '📖', color: '#F43F5E', tagline: 'Words' },
    ],
    drops: drops.map((d) => ({
      ...d,
      title: `${d.category} ${d.date} ${d.drop}`,
      path: `${d.category}/${d.date}/drop-${d.drop}.json`,
    })),
  };
}
