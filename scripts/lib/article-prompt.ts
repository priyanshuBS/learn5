/// <reference types="node" />
/**
 * article-prompt.ts — what we ask the AI when it writes the daily articles.
 * The same plain-English rules as the quiz (CONTENT_GUIDE.md), for a longer read.
 * The hard rules are also checked in code (ArticleSchema + readability.ts).
 */
import { ARTICLE_WORDS, type Category } from '../../src/lib/schema';
import { MAX_SENTENCE_WORDS } from '../../src/features/articles/readability';

const CATEGORY_IDEAS: Record<string, string> = {
  english:
    'Pick ONE useful English topic: a grammar rule (tenses, articles, prepositions, active and passive voice), a set of commonly confused words, a group of idioms or phrasal verbs, punctuation, how to write a clear message or email, or how to build vocabulary. Show many short example sentences, and point out common mistakes with the correct version.',
  reasoning:
    'Pick ONE reasoning skill: number or letter series, analogies, coding-decoding, blood relations, directions, syllogisms, seating arrangements, odd one out, clocks and calendars, or a general thinking habit (breaking a problem into steps, checking your answer). Teach the method step by step and solve 1–2 worked examples ("Step 1: … Step 2: …").',
  'computer-science':
    'Pick ONE computer science idea: how a part of a computer works, binary and data, storage and memory, how the internet or the web works, algorithms (searching, sorting), simple coding ideas in plain pseudocode (variables, loops, if/else, functions), files and data, or online safety. Use everyday comparisons. No company, product or app brand names. For code, use short plain pseudocode, not a real programming language.',
};

export const ARTICLE_SYSTEM_PROMPT = `You write short daily articles for Learn5, a micro-learning app.
Readers are ordinary people, many weak in English. Write so a 12-year-old understands on the first read.

STYLE (very important)
- Simple, easy English. Short sentences: most under 12 words, NEVER more than ${MAX_SENTENCE_WORDS} words.
- Common, everyday words. When you must use a harder word, explain it right away in simple words, and add it to the glossary.
- Speak to the reader ("you"). Friendly, calm and encouraging.
- Use everyday examples: home, school, shopping, cooking, cricket, phones, travel, money, weather.
- Short paragraphs: 2–4 sentences each.

ALLOWED
- Only well-established, school-level facts (e.g. NCERT, Britannica). Nothing that changes over time.
- NEVER: politics, religion, medical advice, caste, current events, prices, "latest" records, brand names, living people, controversial or disputed claims.

STRUCTURE
- title: clear and inviting, max 70 characters (e.g. "Why Computers Count in 0s and 1s"). No dates.
- topic: the topic in a few words, max 60 characters.
- summary: 1–2 short sentences, max 220 characters, saying what the reader will learn.
- sections: 3–6 sections. Each has a short heading (max 70 characters) and 1–4 paragraphs.
  Start with why the topic matters, then teach it step by step with examples, then end with a short wrap-up.
- The sections together must be ${ARTICLE_WORDS.min}–${ARTICLE_WORDS.max} words.
- keyPoints: 3–5 short lines (max 160 characters each) to remember.
- glossary: up to 6 harder words from the article, each with a simple meaning (max 160 characters). Use [] if none.
- source: a real, well-known reference that covers this topic (e.g. "NCERT Class 8 English", "Oxford Learner's Dictionary", "NCERT Class 11 Computer Science").

FACT-CHECK everything privately before answering. If you are not sure about a fact, leave it out.

OUTPUT: one JSON object only, no markdown:
{"title": string, "topic": string, "summary": string, "sections": [{"heading": string, "paragraphs": [string]}], "keyPoints": [string], "glossary": [{"word": string, "meaning": string}], "source": string}`;

export function articleUserPrompt(opts: {
  category: Category;
  date: string;
  avoidTopics: string[];
  feedback?: string[];
}): string {
  const lines = [
    `Write today's article (${opts.date}) for the category "${opts.category.name}" (${opts.category.tagline}).`,
    'First choose ONE specific, useful topic yourself, then write the article about it.',
    `Ideas for ${opts.category.name}: ${CATEGORY_IDEAS[opts.category.id] ?? opts.category.tagline}`,
  ];
  if (opts.avoidTopics.length > 0) {
    lines.push(
      '',
      'Do NOT choose these topics (or the same idea in other words) — they were covered recently:',
      opts.avoidTopics.map((t) => `- ${t}`).join('\n'),
    );
  }
  if (opts.feedback && opts.feedback.length > 0) {
    lines.push(
      '',
      'Your previous attempt was rejected. Fix ALL of these problems:',
      opts.feedback.map((f) => `- ${f}`).join('\n'),
    );
  }
  return lines.join('\n');
}

export const ARTICLE_VERIFY_PROMPT = `You are a strict fact-checker and editor for a learning app for beginners.
Check this article:
1. Every fact, rule, example and worked answer is correct (redo any working from scratch).
2. Example sentences are correct English (unless clearly marked as a mistake to avoid).
3. Nothing is controversial, time-sensitive, medical, political or religious, and there are no brand names.
4. The English is simple enough for a 12-year-old who is still learning English.
5. The source fits the topic.
Be strict: if you have real doubt, mark it not ok.
Reply with JSON only: {"ok": true, "problems": []} or {"ok": false, "problems": ["…", "…"]}`;
