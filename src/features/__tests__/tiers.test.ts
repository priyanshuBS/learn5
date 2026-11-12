/**
 * Tests for question tiers: moving up after strong drops, down after tough ones,
 * and the content paths of each tier.
 */
import { describe, expect, it } from '@jest/globals';

import { makeResult } from '@/test-utils/fixtures';

import type { DropResult } from '../progress/store';
import { getMistakes } from '../review/mistakes';
import { computeTier, computeTiers, tierPath } from '../tiers/tiers';

// Item 4 of the fixture is a fact card (never counted as right or wrong).
const STRONG = [true, true, true, true, false]; // 1 wrong → strong
const OK = [true, true, false, true, false]; // 2 wrong → neither
const TOUGH = [false, false, true, true, false]; // 3 wrong → tough

let day = 0;
/** A result on the next day, so results are in order. */
function play(correct: boolean[], tier?: number, category = 'english'): DropResult {
  day++;
  const date = `2026-11-${String(day).padStart(2, '0')}`;
  return makeResult({ category, date, correct, tier });
}

describe('computeTier', () => {
  it('starts everyone at Basic', () => {
    expect(computeTier([])).toMatchObject({ tier: 1, name: 'Basic', strongInARow: 0 });
  });

  it('moves up after 3 strong drops in a row', () => {
    day = 0;
    const results = [play(STRONG), play(STRONG), play(STRONG)];
    expect(computeTier(results)).toMatchObject({ tier: 2, name: 'Intermediate', strongInARow: 0 });
  });

  it('needs the 3 strong drops to be in a row', () => {
    day = 0;
    const results = [play(STRONG), play(STRONG), play(OK), play(STRONG)];
    expect(computeTier(results)).toMatchObject({ tier: 1, strongInARow: 1 });
  });

  it('only counts drops played at the current tier', () => {
    day = 0;
    // Promoted to 2; then two strong drops that were still served at tier 1.
    const results = [play(STRONG), play(STRONG), play(STRONG), play(STRONG, 1), play(STRONG, 1)];
    expect(computeTier(results)).toMatchObject({ tier: 2, strongInARow: 0 });
  });

  it('reaches Advanced and stops there', () => {
    day = 0;
    const results = [
      ...[1, 1, 1].map(() => play(STRONG)),
      ...[1, 1, 1].map(() => play(STRONG, 2)),
      ...[1, 1, 1].map(() => play(STRONG, 3)),
    ];
    expect(computeTier(results)).toMatchObject({ tier: 3, name: 'Advanced', nextName: null });
  });

  it('moves down after 3 tough drops in a row', () => {
    day = 0;
    const results = [
      ...[1, 1, 1].map(() => play(STRONG)),
      play(TOUGH, 2),
      play(TOUGH, 2),
      play(TOUGH, 2),
    ];
    expect(computeTier(results)).toMatchObject({ tier: 1 });
  });

  it('never drops below Basic', () => {
    day = 0;
    expect(computeTier([play(TOUGH), play(TOUGH), play(TOUGH)]).tier).toBe(1);
  });

  it('does not care about the order results are given in', () => {
    day = 0;
    const results = [play(STRONG), play(STRONG), play(STRONG), play(TOUGH, 2)];
    expect(computeTier([...results].reverse())).toMatchObject({ tier: 2, toughInARow: 1 });
  });
});

describe('computeTiers', () => {
  it('keeps every category separate', () => {
    day = 0;
    const list = [
      play(STRONG, 1, 'english'),
      play(STRONG, 1, 'english'),
      play(STRONG, 1, 'english'),
      play(STRONG, 1, 'reasoning'),
    ];
    const tiers = computeTiers(
      Object.fromEntries(list.map((r) => [`${r.category}/${r.date}/${r.drop}`, r])),
      ['english', 'reasoning', 'computer-science'],
    );
    expect(tiers.english.tier).toBe(2);
    expect(tiers.reasoning).toMatchObject({ tier: 1, strongInARow: 1 });
    expect(tiers['computer-science'].tier).toBe(1);
  });
});

describe('tierPath', () => {
  it('keeps tier 1 paths unchanged and adds the tier for higher ones', () => {
    expect(tierPath('english/2026-11-08/drop-1.json', 1)).toBe('english/2026-11-08/drop-1.json');
    expect(tierPath('computer-science/2026-11-08/drop-3.json', 3)).toBe(
      'computer-science/2026-11-08/drop-3-t3.json',
    );
  });
});

describe('mistakes remember their tier', () => {
  it('so Review can load the right tier file', () => {
    const r = makeResult({
      category: 'english',
      correct: [false, true, true, true, true],
      tier: 2,
    });
    expect(getMistakes({ k: r }, {})[0].tier).toBe(2);
    const old = makeResult({ category: 'english', correct: [false, true, true, true, true] });
    expect(getMistakes({ k: old }, {})[0].tier).toBe(1);
  });
});
