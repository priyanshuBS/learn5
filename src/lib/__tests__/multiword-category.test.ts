import { describe, expect, it } from '@jest/globals';

import { DropSchema, makeItemId } from '../schema';

/** A valid drop for a subject whose id has a dash (e.g. "computer-science"). */
function drop(category: string) {
  const date = '2026-11-10';
  const base = (i: number, difficulty: 'easy' | 'medium' | 'hard', topic: string) => ({
    id: makeItemId(category, date, 1, i),
    difficulty,
    topic,
    explanation: 'A short and simple explanation for the learner.',
    source: 'NCERT Class 9 Computer Science',
  });
  return {
    date,
    category,
    drop: 1,
    title: 'How Computers Think',
    items: [
      {
        ...base(1, 'easy', 'Input devices'),
        type: 'mcq',
        question: 'Which is an input device?',
        options: ['Keyboard', 'Monitor', 'Printer', 'Speaker'],
        answerIndex: 0,
      },
      {
        ...base(2, 'easy', 'Binary'),
        type: 'true_false',
        question: 'Computers store data as 0s and 1s.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        ...base(3, 'medium', 'Storage units'),
        type: 'mcq',
        question: 'How many bits make a byte?',
        options: ['4', '8', '16', '2'],
        answerIndex: 1,
      },
      {
        ...base(4, 'medium', 'The web'),
        type: 'fill_blank',
        question: 'A web address is also called a ___.',
        answer: 'URL',
      },
      {
        ...base(5, 'hard', 'Algorithms'),
        type: 'mcq',
        question: 'A step-by-step plan to solve a problem is an…',
        options: ['Virus', 'Algorithm', 'Pixel', 'Cable'],
        answerIndex: 1,
      },
    ],
  };
}

describe('subjects with a dash in their id', () => {
  it('builds item ids like "computer-science-2026-11-10-d1-01"', () => {
    expect(makeItemId('computer-science', '2026-11-10', 1, 1)).toBe(
      'computer-science-2026-11-10-d1-01',
    );
  });

  it('accepts a valid computer-science drop', () => {
    const result = DropSchema.safeParse(drop('computer-science'));
    expect(result.success).toBe(true);
  });
});
