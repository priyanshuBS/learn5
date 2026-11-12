/**
 * readability.ts — checks that an article is written in simple, easy English,
 * and works out how long it takes to read. Used by the article generator (a draft
 * that fails is sent back to the AI with the problems) and by the app.
 */
import { ARTICLE_WORDS, type Article } from '@/lib/schema';

/** Longest sentence allowed, in words. */
export const MAX_SENTENCE_WORDS = 25;
/** Highest average sentence length allowed, in words. */
export const MAX_AVERAGE_SENTENCE_WORDS = 15;
/** Slow, careful reading speed (words per minute), so the estimate suits learners. */
export const WORDS_PER_MINUTE = 150;

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

/** Splits text into sentences (at . ! ? followed by a space or the end). */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) > 0);
}

/** All the reading text of an article (sections only; lists are short already). */
export function articleText(article: Pick<Article, 'sections'>): string {
  return article.sections.flatMap((s) => s.paragraphs).join(' ');
}

/** Minutes to read the whole article, at least 1. */
export function readingMinutes(article: Pick<Article, 'sections' | 'keyPoints'>): number {
  const words = countWords(articleText(article)) + countWords(article.keyPoints.join(' '));
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Problems with the article's English (empty = simple enough). */
export function readabilityProblems(article: Pick<Article, 'sections'>): string[] {
  const problems: string[] = [];
  const text = articleText(article);
  const words = countWords(text);
  if (words < ARTICLE_WORDS.min) {
    problems.push(
      `The article is too short (${words} words). Write ${ARTICLE_WORDS.min}–${ARTICLE_WORDS.max} words.`,
    );
  }
  if (words > ARTICLE_WORDS.max) {
    problems.push(
      `The article is too long (${words} words). Write ${ARTICLE_WORDS.min}–${ARTICLE_WORDS.max} words.`,
    );
  }
  const all = sentences(text);
  const long = all.filter((s) => countWords(s) > MAX_SENTENCE_WORDS);
  for (const s of long.slice(0, 3)) {
    problems.push(`This sentence is too long (${countWords(s)} words). Split it: "${s}"`);
  }
  const average = all.length > 0 ? words / all.length : 0;
  if (average > MAX_AVERAGE_SENTENCE_WORDS) {
    problems.push(
      `Sentences are too long on average (${average.toFixed(1)} words). Keep most under ${MAX_AVERAGE_SENTENCE_WORDS} words.`,
    );
  }
  return problems;
}
