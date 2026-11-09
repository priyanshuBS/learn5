/**
 * levels.ts — turns total points into a level with a fun name.
 * A perfect drop is worth 100 points, so Level 2 takes about one perfect drop.
 */
export const LEVELS = [
  { level: 1, name: 'Beginner', minPoints: 0 },
  { level: 2, name: 'Curious', minPoints: 100 },
  { level: 3, name: 'Learner', minPoints: 300 },
  { level: 4, name: 'Explorer', minPoints: 600 },
  { level: 5, name: 'Thinker', minPoints: 1000 },
  { level: 6, name: 'Scholar', minPoints: 1600 },
  { level: 7, name: 'Expert', minPoints: 2500 },
  { level: 8, name: 'Master', minPoints: 4000 },
  { level: 9, name: 'Genius', minPoints: 6000 },
  { level: 10, name: 'Legend', minPoints: 9000 },
] as const;

export interface LevelInfo {
  level: number;
  name: string;
  /** Points needed for the next level (null at the top level). */
  nextAt: number | null;
  /** 0–1: how far you are towards the next level. */
  progress: number;
}

export function levelFor(points: number): LevelInfo {
  const safe = Math.max(0, points);
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (safe >= l.minPoints) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  if (!next) return { level: current.level, name: current.name, nextAt: null, progress: 1 };
  const progress = (safe - current.minPoints) / (next.minPoints - current.minPoints);
  return { level: current.level, name: current.name, nextAt: next.minPoints, progress };
}
