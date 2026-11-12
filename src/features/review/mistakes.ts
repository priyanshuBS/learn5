/**
 * mistakes.ts — finds the questions the user got wrong, for "Review my mistakes",
 * and the fact cards they have collected, for the Flashcards deck.
 *
 * A mistake leaves the list once it is answered correctly in Review mode.
 */
import type { DropRef } from '../drops/status';
import type { DropResult } from '../progress/store';
import { resultTier } from '../tiers/tiers';

export interface MistakeRef {
  itemId: string;
  drop: DropRef;
  /** The tier the drop was played at (its questions live in that tier's file). */
  tier: number;
  /** What the user answered the first time. */
  given: string | null;
  completedAt: string;
}

/** Wrong answers not yet fixed, newest first. Optional category filter. */
export function getMistakes(
  results: Record<string, DropResult>,
  fixed: Record<string, string>,
  category?: string,
): MistakeRef[] {
  return Object.values(results)
    .filter((r) => !category || r.category === category)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .flatMap((r) =>
      r.items
        .filter((i) => !i.correct && i.type !== 'fact_card' && !fixed[i.itemId])
        .map((i) => ({
          itemId: i.itemId,
          drop: { category: r.category, date: r.date, drop: r.drop },
          tier: resultTier(r),
          given: i.given,
          completedAt: r.completedAt,
        })),
    );
}

/** Fact cards from drops the user has finished (no spoilers), newest first. */
export function getCollectedFactCards(
  results: Record<string, DropResult>,
): { itemId: string; drop: DropRef; tier: number }[] {
  return Object.values(results)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .flatMap((r) =>
      r.items
        .filter((i) => i.type === 'fact_card')
        .map((i) => ({
          itemId: i.itemId,
          drop: { category: r.category, date: r.date, drop: r.drop },
          tier: resultTier(r),
        })),
    );
}
