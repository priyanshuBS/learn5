import { describe, expect, it } from '@jest/globals';

import { LEVELS, levelFor } from '../levels/levels';
import { PERFECT_BONUS, scoreDrop } from '../points/points';

describe('scoreDrop (points)', () => {
  const fullDrop = [
    { difficulty: 'easy' as const, correct: true },
    { difficulty: 'easy' as const, correct: true },
    { difficulty: 'medium' as const, correct: true },
    { difficulty: 'medium' as const, correct: true },
    { difficulty: 'hard' as const, correct: true },
  ];

  it('gives 10 / 20 / 30 per difficulty plus a +10 perfect bonus', () => {
    // 10 + 10 + 20 + 20 + 30 = 90, + 10 bonus = 100
    expect(scoreDrop(fullDrop)).toEqual({
      correctCount: 5,
      basePoints: 90,
      bonus: PERFECT_BONUS,
      total: 100,
      perfect: true,
    });
  });

  it('gives no bonus when one answer is wrong', () => {
    const items = fullDrop.map((it, i) => (i === 4 ? { ...it, correct: false } : it));
    expect(scoreDrop(items)).toMatchObject({
      correctCount: 4,
      total: 60,
      bonus: 0,
      perfect: false,
    });
  });

  it('gives 0 points when everything is wrong', () => {
    expect(scoreDrop(fullDrop.map((it) => ({ ...it, correct: false }))).total).toBe(0);
  });

  it('treats an empty drop as 0, not perfect', () => {
    expect(scoreDrop([])).toMatchObject({ total: 0, perfect: false });
  });
});

describe('levelFor', () => {
  it('starts at level 1 with no points', () => {
    expect(levelFor(0)).toEqual({ level: 1, name: 'Beginner', nextAt: 100, progress: 0 });
  });

  it('reaches level 2 at exactly 100 points', () => {
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
  });

  it('measures progress towards the next level', () => {
    // Level 2 starts at 100, level 3 at 300: 200 points is halfway.
    expect(levelFor(200).progress).toBeCloseTo(0.5);
  });

  it('stops at the top level', () => {
    const top = LEVELS[LEVELS.length - 1];
    expect(levelFor(top.minPoints + 50_000)).toEqual({
      level: top.level,
      name: top.name,
      nextAt: null,
      progress: 1,
    });
  });

  it('never goes below level 1', () => {
    expect(levelFor(-50).level).toBe(1);
  });

  it('has level thresholds that always go up', () => {
    LEVELS.forEach((l, i) => {
      if (i > 0) expect(l.minPoints).toBeGreaterThan(LEVELS[i - 1].minPoints);
    });
  });
});
