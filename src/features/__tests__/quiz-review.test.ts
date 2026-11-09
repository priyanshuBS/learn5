import { describe, expect, it } from '@jest/globals';

import type { FillBlankItem } from '@/lib/schema';
import { shuffle } from '@/lib/shuffle';
import { byKey, makeResult } from '@/test-utils/fixtures';

import { isFillBlankCorrect, normalizeAnswer } from '../quiz/check';
import { getCollectedFactCards, getMistakes } from '../review/mistakes';

describe('normalizeAnswer', () => {
  it.each([
    ['  Joule. ', 'joule'],
    ['H₂O', 'h2o'],
    ['₹1,020', '1020'],
    ['25%', '25'],
    ['9.8', '9.8'],
    ['Carbon   Dioxide', 'carbon dioxide'],
  ])('"%s" → "%s"', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });
});

describe('isFillBlankCorrect', () => {
  const item: FillBlankItem = {
    id: 'physics-2026-11-07-d3-04',
    type: 'fill_blank',
    difficulty: 'medium',
    topic: 'Unit of energy',
    question: 'The SI unit of energy is the ___.',
    answer: 'joule',
    acceptedAnswers: ['joules', 'J'],
    explanation: 'Energy and work are both measured in joules.',
    source: 'NCERT Class 9 Science',
  };

  it('accepts the answer in any letter case', () => {
    expect(isFillBlankCorrect(item, 'JOULE')).toBe(true);
  });

  it('accepts listed alternative spellings', () => {
    expect(isFillBlankCorrect(item, 'joules')).toBe(true);
    expect(isFillBlankCorrect(item, 'j')).toBe(true);
  });

  it('rejects wrong and empty answers', () => {
    expect(isFillBlankCorrect(item, 'watt')).toBe(false);
    expect(isFillBlankCorrect(item, '   ')).toBe(false);
  });
});

describe('getMistakes (Review my mistakes)', () => {
  // Item 3 wrong, item 4 (fact card) "wrong" must be ignored.
  const older = makeResult({
    date: '2026-11-07',
    completedAt: '2026-11-07T10:00:00.000Z',
    correct: [true, true, false, false, true],
  });
  const newer = makeResult({
    category: 'english',
    completedAt: '2026-11-08T10:00:00.000Z',
    correct: [false, true, true, true, true],
  });
  const results = byKey([older, newer]);

  it('lists wrong answers, newest first, skipping fact cards', () => {
    expect(getMistakes(results, {}).map((m) => m.itemId)).toEqual([
      'english-2026-11-08-d1-01',
      'math-2026-11-07-d1-03',
    ]);
  });

  it('removes mistakes that were fixed', () => {
    const fixed = { 'english-2026-11-08-d1-01': '2026-11-08T11:00:00.000Z' };
    expect(getMistakes(results, fixed).map((m) => m.itemId)).toEqual(['math-2026-11-07-d1-03']);
  });

  it('can filter by category', () => {
    expect(getMistakes(results, {}, 'math')).toHaveLength(1);
  });

  it('remembers what the user answered', () => {
    expect(getMistakes(results, {})[0]).toMatchObject({ given: 'wrong' });
  });
});

describe('getCollectedFactCards', () => {
  it('collects one fact card per finished drop that has one', () => {
    const results = byKey([makeResult({ drop: 1 }), makeResult({ drop: 2 })]);
    expect(
      getCollectedFactCards(results)
        .map((c) => c.itemId)
        .sort(),
    ).toEqual(['math-2026-11-08-d1-04', 'math-2026-11-08-d2-04']);
  });
});

describe('shuffle', () => {
  it('keeps every card exactly once and does not change the original', () => {
    const list = [1, 2, 3, 4, 5];
    const result = shuffle(list, () => 0.3);
    expect([...result].sort()).toEqual(list);
    expect(list).toEqual([1, 2, 3, 4, 5]);
  });
});
