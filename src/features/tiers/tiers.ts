/**
 * tiers.ts — how hard a player's questions are, per category.
 *
 * Every drop is written at 3 tiers: Basic → Intermediate → Advanced.
 * Each category has its own tier, worked out from the player's saved results
 * (like badges), so it is the same on every device and never gets out of sync.
 *
 *   Move UP:   3 strong drops in a row at your tier (at most 1 wrong answer each)
 *   Move DOWN: 3 tough drops in a row at your tier (3 or more wrong answers each)
 *
 * Only first plays count (replays are practice). Fact cards are not questions,
 * so they are not counted as right or wrong.
 */
import { MAX_TIER } from '@/lib/schema';

import type { DropResult } from '../progress/store';

export const TIER_NAMES: Record<number, string> = {
  1: 'Basic',
  2: 'Intermediate',
  3: 'Advanced',
};

/** Drops in a row needed to move up or down. */
export const DROPS_TO_MOVE = 3;
/** A drop is "strong" with at most this many wrong answers. */
export const STRONG_MAX_WRONG = 1;
/** A drop is "tough" with at least this many wrong answers. */
export const TOUGH_MIN_WRONG = 3;

export interface TierInfo {
  tier: number;
  name: string;
  /** Strong drops in a row at this tier (0 to DROPS_TO_MOVE - 1). */
  strongInARow: number;
  /** Tough drops in a row at this tier. */
  toughInARow: number;
  /** The next tier's name, or null at the top. */
  nextName: string | null;
}

export function tierName(tier: number): string {
  return TIER_NAMES[tier] ?? TIER_NAMES[1];
}

/** The tier a saved result was played at (older results have none = 1). */
export function resultTier(result: Pick<DropResult, 'tier'>): number {
  return result.tier && result.tier >= 1 && result.tier <= MAX_TIER ? result.tier : 1;
}

function wrongAnswers(result: DropResult): number {
  return result.items.filter((i) => i.type !== 'fact_card' && !i.correct).length;
}

/** Works out the tier from one category's results (any order). */
export function computeTier(results: DropResult[]): TierInfo {
  const ordered = [...results].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  let tier = 1;
  let strong = 0;
  let tough = 0;
  for (const r of ordered) {
    // Only drops played at the current tier say anything about it.
    if (resultTier(r) !== tier) continue;
    const wrong = wrongAnswers(r);
    strong = wrong <= STRONG_MAX_WRONG ? strong + 1 : 0;
    tough = wrong >= TOUGH_MIN_WRONG ? tough + 1 : 0;
    if (strong >= DROPS_TO_MOVE && tier < MAX_TIER) {
      tier++;
      strong = 0;
      tough = 0;
    } else if (tough >= DROPS_TO_MOVE && tier > 1) {
      tier--;
      strong = 0;
      tough = 0;
    }
  }
  return {
    tier,
    name: tierName(tier),
    strongInARow: Math.min(strong, DROPS_TO_MOVE - 1),
    toughInARow: tough,
    nextName: tier < MAX_TIER ? tierName(tier + 1) : null,
  };
}

/** Tiers for every category, from all saved results. */
export function computeTiers(
  results: Record<string, DropResult>,
  categoryIds: string[],
): Record<string, TierInfo> {
  const byCategory = new Map<string, DropResult[]>(categoryIds.map((id) => [id, []]));
  for (const r of Object.values(results)) byCategory.get(r.category)?.push(r);
  return Object.fromEntries(categoryIds.map((id) => [id, computeTier(byCategory.get(id) ?? [])]));
}

/**
 * The content path of a drop at a tier.
 *   tier 1: "english/2026-11-08/drop-1.json" (unchanged)
 *   tier 2: "english/2026-11-08/drop-1-t2.json"
 */
export function tierPath(path: string, tier: number): string {
  return tier > 1 ? path.replace(/\.json$/, `-t${tier}.json`) : path;
}
