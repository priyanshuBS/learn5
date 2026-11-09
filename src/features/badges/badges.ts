/**
 * badges.ts — the 5 Learn5 badges and how close the user is to each.
 *
 *   🎯 First Drop    finish your first drop
 *   🔥 On Fire       7-day streak
 *   🌋 Unstoppable   30-day streak
 *   💯 Century       100 correct answers (fact cards don't count)
 *   🌈 All-Rounder   play every category in one day
 *
 * Badges are worked out from saved results every time, so they can never get
 * out of sync with your progress.
 */
import type { DropResult } from '../progress/store';
import { computeStreak } from '../streaks/streak';

export interface BadgeStatus {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  /** 0 to 1 */
  progress: number;
  /** e.g. "37 / 100" */
  progressLabel: string;
}

interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  target: number;
  /** How far the user is (compared with target). */
  measure: (facts: BadgeFacts) => number;
}

export interface BadgeFacts {
  dropsDone: number;
  bestStreak: number;
  correctAnswers: number;
  /** Most different categories played on a single day. */
  mostCategoriesInADay: number;
  totalCategories: number;
}

const DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-drop',
    emoji: '🎯',
    name: 'First Drop',
    description: 'Finish your very first drop.',
    target: 1,
    measure: (f) => f.dropsDone,
  },
  {
    id: 'streak-7',
    emoji: '🔥',
    name: 'On Fire',
    description: 'Play at least one drop every day for 7 days.',
    target: 7,
    measure: (f) => f.bestStreak,
  },
  {
    id: 'streak-30',
    emoji: '🌋',
    name: 'Unstoppable',
    description: 'Keep your streak going for 30 days.',
    target: 30,
    measure: (f) => f.bestStreak,
  },
  {
    id: 'correct-100',
    emoji: '💯',
    name: 'Century',
    description: 'Get 100 questions right.',
    target: 100,
    measure: (f) => f.correctAnswers,
  },
  {
    id: 'all-categories',
    emoji: '🌈',
    name: 'All-Rounder',
    description: 'Play a drop in every category on the same day.',
    target: -1, // replaced by the number of categories
    measure: (f) => f.mostCategoriesInADay,
  },
];

/** Collects the numbers the badges need from saved results. */
export function badgeFacts(
  results: DropResult[],
  totalCategories: number,
  today: string,
): BadgeFacts {
  const categoriesByDay = new Map<string, Set<string>>();
  for (const r of results) {
    const set = categoriesByDay.get(r.completedOn) ?? new Set<string>();
    set.add(r.category);
    categoriesByDay.set(r.completedOn, set);
  }
  const correctAnswers = results.reduce(
    (n, r) => n + r.items.filter((i) => i.correct && i.type !== 'fact_card').length,
    0,
  );
  return {
    dropsDone: results.length,
    bestStreak: computeStreak(
      results.map((r) => r.completedOn),
      today,
    ).best,
    correctAnswers,
    mostCategoriesInADay: Math.max(0, ...[...categoriesByDay.values()].map((s) => s.size)),
    totalCategories,
  };
}

/** Every badge with earned / progress info, in display order. */
export function computeBadges(facts: BadgeFacts): BadgeStatus[] {
  return DEFINITIONS.map((def) => {
    const target = def.id === 'all-categories' ? Math.max(1, facts.totalCategories) : def.target;
    const value = Math.min(def.measure(facts), target);
    return {
      id: def.id,
      emoji: def.emoji,
      name: def.name,
      description: def.description,
      earned: value >= target,
      progress: value / target,
      progressLabel: `${value} / ${target}`,
    };
  });
}

/** Badges earned in `after` that were not earned in `before` (for the "New badge!" message). */
export function newlyEarned(before: BadgeStatus[], after: BadgeStatus[]): BadgeStatus[] {
  const had = new Set(before.filter((b) => b.earned).map((b) => b.id));
  return after.filter((b) => b.earned && !had.has(b.id));
}
