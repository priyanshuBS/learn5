/**
 * points.ts — how many points a drop is worth.
 *
 *   easy = 10, medium = 20, hard = 30 (only for correct answers)
 *   +10 bonus when all 5 are correct (a "perfect drop")
 *   Fact cards count as correct once you read them.
 */
import type { Difficulty } from '@/lib/schema';

export const POINTS_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };
export const PERFECT_BONUS = 10;

export interface ScoredItem {
  difficulty: Difficulty;
  correct: boolean;
}

export interface DropScore {
  correctCount: number;
  basePoints: number;
  bonus: number;
  total: number;
  perfect: boolean;
}

export function scoreDrop(items: ScoredItem[]): DropScore {
  const correct = items.filter((i) => i.correct);
  const basePoints = correct.reduce((sum, i) => sum + POINTS_BY_DIFFICULTY[i.difficulty], 0);
  const perfect = items.length > 0 && correct.length === items.length;
  const bonus = perfect ? PERFECT_BONUS : 0;
  return { correctCount: correct.length, basePoints, bonus, total: basePoints + bonus, perfect };
}
