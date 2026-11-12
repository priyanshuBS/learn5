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

/** The sample drop with a different difficulty for each of the 5 items. */
function withDifficulties(levels: string[]): any {
  const drop = copy();
  drop.items.forEach((it: any, i: number) => {
    it.difficulty = levels[i];
  });
  return drop;
}

describe('DropSchema difficulty ladder', () => {
  it('accepts the ladder: 1 easy, 2 medium, 2 hard', () => {
    expect(
      DropSchema.safeParse(withDifficulties(['easy', 'medium', 'medium', 'hard', 'hard'])).success,
    ).toBe(true);
  });

  it('still accepts older drops (2 easy, 2 medium, 1 hard)', () => {
    expect(
      DropSchema.safeParse(withDifficulties(['easy', 'easy', 'medium', 'medium', 'hard'])).success,
    ).toBe(true);
  });

  it('rejects a drop that is all easy', () => {
    expect(
      DropSchema.safeParse(withDifficulties(['easy', 'easy', 'easy', 'easy', 'easy'])).success,
    ).toBe(false);
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
    drop.items[0].difficulty = 'medium'; // 1 easy, 3 medium, 1 hard: neither mix
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
