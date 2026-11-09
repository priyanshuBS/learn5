/**
 * stats.ts — all the numbers shown to the user, worked out from saved results:
 * points, level, streak and badges. A pure function, so it's easy to test.
 */
import { badgeFacts, computeBadges, type BadgeStatus } from './badges/badges';
import { levelFor, type LevelInfo } from './levels/levels';
import type { DropResult } from './progress/store';
import { computeStreak, type StreakInfo } from './streaks/streak';

export interface UserStats {
  points: number;
  level: LevelInfo;
  streak: StreakInfo;
  dropsDone: number;
  correctAnswers: number;
  badges: BadgeStatus[];
}

export function computeStats(
  results: Record<string, DropResult>,
  totalCategories: number,
  today: string,
): UserStats {
  const all = Object.values(results);
  const points = all.reduce((sum, r) => sum + r.points, 0);
  const facts = badgeFacts(all, totalCategories, today);
  return {
    points,
    level: levelFor(points),
    streak: computeStreak(
      all.map((r) => r.completedOn),
      today,
    ),
    dropsDone: all.length,
    correctAnswers: facts.correctAnswers,
    badges: computeBadges(facts),
  };
}
