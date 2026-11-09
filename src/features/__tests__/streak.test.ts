import { describe, expect, it } from '@jest/globals';

import { computeStreak } from '../streaks/streak';

const TODAY = '2026-11-08';

describe('computeStreak', () => {
  it('is 0 when nothing was played', () => {
    expect(computeStreak([], TODAY)).toEqual({ current: 0, best: 0, playedToday: false });
  });

  it('counts today', () => {
    expect(computeStreak(['2026-11-08'], TODAY)).toEqual({
      current: 1,
      best: 1,
      playedToday: true,
    });
  });

  it('keeps yesterday’s streak alive until today ends', () => {
    expect(computeStreak(['2026-11-06', '2026-11-07'], TODAY)).toEqual({
      current: 2,
      best: 2,
      playedToday: false,
    });
  });

  it('breaks after a missed day', () => {
    // Played 5 and 6 Nov, missed the 7th
    expect(computeStreak(['2026-11-05', '2026-11-06'], TODAY).current).toBe(0);
  });

  it('counts several drops on one day only once', () => {
    expect(computeStreak(['2026-11-08', '2026-11-08', '2026-11-07'], TODAY).current).toBe(2);
  });

  it('remembers the best streak from the past', () => {
    const past = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']; // 4 days
    expect(computeStreak([...past, '2026-11-08'], TODAY)).toEqual({
      current: 1,
      best: 4,
      playedToday: true,
    });
  });

  it('works across month and year ends', () => {
    const days = ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'];
    expect(computeStreak(days, '2027-01-02').current).toBe(4);
  });
});
