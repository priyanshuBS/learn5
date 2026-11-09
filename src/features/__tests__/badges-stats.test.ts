import { describe, expect, it } from '@jest/globals';

import { byKey, makeResult } from '@/test-utils/fixtures';

import { badgeFacts, computeBadges, newlyEarned } from '../badges/badges';
import { computeStats } from '../stats';

const TODAY = '2026-11-08';
const earnedIds = (results: ReturnType<typeof makeResult>[], categories = 2) =>
  computeBadges(badgeFacts(results, categories, TODAY))
    .filter((b) => b.earned)
    .map((b) => b.id);

describe('badges', () => {
  it('has no badges before playing', () => {
    expect(earnedIds([])).toEqual([]);
  });

  it('gives "First Drop" after one drop', () => {
    expect(earnedIds([makeResult()])).toContain('first-drop');
  });

  it('gives "On Fire" for a 7-day streak, not for 6', () => {
    const days = (n: number) =>
      Array.from({ length: n }, (_, i) =>
        makeResult({ date: `2026-11-0${i + 1}`, completedOn: `2026-11-0${i + 1}` }),
      );
    expect(earnedIds(days(6))).not.toContain('streak-7');
    expect(earnedIds(days(7))).toContain('streak-7');
    expect(earnedIds(days(7))).not.toContain('streak-30');
  });

  it('counts 100 correct answers, but not fact cards', () => {
    // Each fake drop has 4 real questions + 1 fact card, all correct.
    const drops = Array.from({ length: 25 }, (_, i) =>
      makeResult({ drop: (i % 3) + 1, date: `2026-10-${String(i + 1).padStart(2, '0')}` }),
    );
    const facts = badgeFacts(drops, 2, TODAY);
    expect(facts.correctAnswers).toBe(100); // 25 drops × 4 questions
    expect(earnedIds(drops)).toContain('correct-100');
    expect(earnedIds(drops.slice(1))).not.toContain('correct-100'); // 96
  });

  it('gives "All-Rounder" only when every category is played on the same day', () => {
    const math = makeResult({ category: 'math', completedOn: TODAY });
    const englishSameDay = makeResult({ category: 'english', completedOn: TODAY });
    const englishOtherDay = makeResult({ category: 'english', completedOn: '2026-11-07' });
    expect(earnedIds([math, englishOtherDay])).not.toContain('all-categories');
    expect(earnedIds([math, englishSameDay])).toContain('all-categories');
  });

  it('shows progress for badges not yet earned', () => {
    const century = computeBadges(badgeFacts([makeResult()], 6, TODAY)).find(
      (b) => b.id === 'correct-100',
    );
    expect(century).toMatchObject({ earned: false, progressLabel: '4 / 100' });
    expect(century?.progress).toBeCloseTo(0.04);
  });

  it('finds newly earned badges', () => {
    const before = computeBadges(badgeFacts([], 2, TODAY));
    const after = computeBadges(badgeFacts([makeResult()], 2, TODAY));
    expect(newlyEarned(before, after).map((b) => b.id)).toEqual(['first-drop']);
    expect(newlyEarned(after, after)).toEqual([]);
  });
});

describe('computeStats', () => {
  it('adds up points and works out level and streak', () => {
    const results = byKey([
      makeResult({ drop: 1, points: 100 }),
      makeResult({ drop: 2, points: 60 }),
      makeResult({ date: '2026-11-07', completedOn: '2026-11-07', points: 40 }),
    ]);
    const stats = computeStats(results, 6, TODAY);
    expect(stats.points).toBe(200);
    expect(stats.level.level).toBe(2);
    expect(stats.streak.current).toBe(2);
    expect(stats.dropsDone).toBe(3);
  });
});
