/**
 * Tests for the content schema. Run with:  npm test
 * We take a real sample drop, break it in one small way, and make sure the
 * schema notices.
 */
import { describe, expect, it } from '@jest/globals';

import sampleDrop from '../../../content/english/2026-11-08/drop-1.json';
import { addDays, daysBetween, toDateString } from '../dates';
import { DropSchema, isRealDate, makeItemId } from '../schema';

/** A fresh, editable copy of the sample drop for each test. */
const copy = (): any => JSON.parse(JSON.stringify(sampleDrop));

/** Turns the tier-1 sample into a valid drop at another tier (ids + difficulty mix). */
function atTier(tier: number, mix: string[]): any {
  const drop = copy();
  drop.tier = tier;
  drop.items.forEach((it: any, i: number) => {
    it.id = makeItemId(drop.category, drop.date, drop.drop, i + 1, tier);
    it.difficulty = mix[i];
  });
  return drop;
}

describe('DropSchema tiers', () => {
  it('treats a drop without a tier as tier 1', () => {
    expect(DropSchema.parse(copy()).tier).toBe(1);
  });

  it('accepts tier 2 and 3 drops with their own mix and ids', () => {
    expect(
      DropSchema.safeParse(atTier(2, ['easy', 'medium', 'medium', 'hard', 'hard'])).success,
    ).toBe(true);
    expect(
      DropSchema.safeParse(atTier(3, ['medium', 'medium', 'hard', 'hard', 'hard'])).success,
    ).toBe(true);
  });

  it('rejects a tier 3 drop with the easy tier-1 mix', () => {
    expect(
      DropSchema.safeParse(atTier(3, ['easy', 'easy', 'medium', 'medium', 'hard'])).success,
    ).toBe(false);
  });

  it('rejects tier-1 ids on a tier 2 drop', () => {
    const drop = atTier(2, ['easy', 'medium', 'medium', 'hard', 'hard']);
    drop.items[0].id = makeItemId(drop.category, drop.date, drop.drop, 1);
    expect(DropSchema.safeParse(drop).success).toBe(false);
  });

  it('builds tier item ids', () => {
    expect(makeItemId('english', '2026-11-08', 2, 3, 2)).toBe('english-2026-11-08-d2-t2-03');
  });
});

describe('DropSchema', () => {
  it('accepts a valid sample drop', () => {
    expect(DropSchema.safeParse(copy()).success).toBe(true);
  });

  it('rejects a drop with 4 items', () => {
    const drop = copy();
    drop.items.pop();
    expect(DropSchema.safeParse(drop).success).toBe(false);
  });

  it('rejects an mcq with only 3 options', () => {
    const drop = copy();
    const mcq = drop.items.find((it: any) => it.type === 'mcq');
    mcq.options.pop();
    expect(DropSchema.safeParse(drop).success).toBe(false);
  });

  it('rejects the wrong difficulty mix', () => {
    const drop = copy();
    drop.items[0].difficulty = 'hard';
    expect(DropSchema.safeParse(drop).success).toBe(false);
  });

  it('rejects an answerIndex outside the options', () => {
    const drop = copy();
    const tf = drop.items.find((it: any) => it.type === 'true_false');
    tf.answerIndex = 2;
    expect(DropSchema.safeParse(drop).success).toBe(false);
  });

  it('rejects a wrong item id', () => {
    const drop = copy();
    drop.items[0].id = 'english-2026-11-08-d1-05';
    expect(DropSchema.safeParse(drop).success).toBe(false);
  });

  it('rejects unknown fields (typos)', () => {
    const drop = copy();
    drop.items[0].explaination = 'typo';
    expect(DropSchema.safeParse(drop).success).toBe(false);
  });
});

describe('date helpers', () => {
  it('recognises real dates only', () => {
    expect(isRealDate('2026-11-08')).toBe(true);
    expect(isRealDate('2026-02-30')).toBe(false);
    expect(isRealDate('8-11-2026')).toBe(false);
  });

  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-11-01', '2026-12-01')).toBe(30);
  });

  it('formats local dates as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('builds item ids', () => {
    expect(makeItemId('math', '2026-11-08', 2, 3)).toBe('math-2026-11-08-d2-03');
  });
});
