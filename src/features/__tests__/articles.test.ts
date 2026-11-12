/**
 * Tests for articles: the simple-English checks, reading time and the schema.
 */
import { describe, expect, it } from '@jest/globals';

import { ArticleSchema, type Article } from '@/lib/schema';

import {
  countWords,
  readabilityProblems,
  readingMinutes,
  sentences,
} from '../articles/readability';

/** n short sentences of 8 words each. */
const shortText = (n: number) =>
  Array.from({ length: n }, (_, i) => `This is a short and simple sentence number ${i}.`).join(' ');

/** Splits text into paragraphs of up to 6 sentences (like real articles). */
function paragraphs(text: string): string[] {
  const all = sentences(text);
  const out: string[] = [];
  for (let i = 0; i < all.length; i += 6) out.push(all.slice(i, i + 6).join(' '));
  return out.slice(0, 4);
}

function makeArticle(text: string): Article {
  const paragraph = paragraphs(text);
  return {
    category: 'english',
    date: '2026-11-12',
    title: 'How to Use Commas',
    topic: 'Commas',
    summary: 'Learn where commas go, with easy examples.',
    sections: [
      { heading: 'Why commas matter', paragraphs: paragraph },
      { heading: 'Lists', paragraphs: paragraph },
      { heading: 'Wrap-up', paragraphs: paragraph },
    ],
    keyPoints: [
      'Use commas in lists.',
      'Use a comma after "however".',
      'Read your sentence aloud.',
    ],
    glossary: [{ word: 'clause', meaning: 'a group of words with a subject and a verb' }],
    source: 'NCERT Class 8 English',
    readingMinutes: 3,
  };
}

describe('sentences and words', () => {
  it('splits text into sentences and counts words', () => {
    expect(sentences('I run. You walk! Do we stop? Yes')).toHaveLength(4);
    expect(countWords('  Five words are in   here ')).toBe(5);
  });
});

describe('readabilityProblems', () => {
  it('accepts short, simple sentences of the right length', () => {
    // 3 sections × 17 sentences × 9 words ≈ 460 words
    expect(readabilityProblems(makeArticle(shortText(17)))).toEqual([]);
  });

  it('rejects an article that is too short', () => {
    expect(readabilityProblems(makeArticle(shortText(3)))[0]).toMatch(/too short/);
  });

  it('rejects a very long sentence', () => {
    const long = `${Array.from({ length: 30 }, () => 'word').join(' ')}.`;
    const problems = readabilityProblems(makeArticle(`${long} ${shortText(16)}`));
    expect(problems.some((p) => p.includes('too long (30 words)'))).toBe(true);
  });
});

describe('readingMinutes', () => {
  it('is at least 1 and grows with length', () => {
    expect(readingMinutes(makeArticle('Hi.'))).toBe(1);
    expect(readingMinutes(makeArticle(shortText(24)))).toBeGreaterThan(3);
  });
});

describe('ArticleSchema', () => {
  it('accepts a good article', () => {
    expect(ArticleSchema.safeParse(makeArticle(shortText(17))).success).toBe(true);
  });

  it('needs at least 3 sections and 3 key points', () => {
    const a = makeArticle(shortText(17));
    expect(ArticleSchema.safeParse({ ...a, sections: a.sections.slice(0, 2) }).success).toBe(false);
    expect(ArticleSchema.safeParse({ ...a, keyPoints: ['one'] }).success).toBe(false);
  });
});
