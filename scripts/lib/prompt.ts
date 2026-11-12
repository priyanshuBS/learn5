/// <reference types="node" />
/**
 * prompt.ts — what we ask the AI to write, and how we ask it to fact-check.
 *
 * This is a short version of CONTENT_GUIDE.md (the full rulebook for people).
 * If you change a rule there, change it here too. The hard rules are ALSO
 * checked in code (src/lib/schema.ts + generate-drops.ts), so a bad drop is
 * never saved even if the AI ignores the instructions.
 */
import { daysBetween } from '../../src/lib/dates';
import { DIFFICULTY_LADDER, DROPS_PER_DAY, type Category } from '../../src/lib/schema';

const CATEGORY_RULES: Record<string, string> = {
  english:
    'Vocabulary (meanings, synonyms, opposites), grammar, common mistakes (its/it’s, advice/advise), idioms and phrases, correct word usage. Show the word inside a short example sentence.',
  puzzles:
    'Fun brain teasers that have ONE clear answer: classic riddles, number puzzles (missing numbers, magic squares, simple age and counting puzzles), matchstick-style and word puzzles (anagrams, hidden words, letter patterns), logic grid and truth-teller puzzles, and lateral-thinking puzzles with a fair, well-known answer. Describe everything in words (no pictures). Not exam-style reasoning drills (series, analogies, blood relations) — those belong in Reasoning. The explanation MUST show how to solve it step by step.',
  reasoning:
    'Logic puzzles, number and letter series, analogies, coding-decoding, odd one out, directions, blood relations, simple syllogisms. The explanation MUST solve it step by step ("Step 1: … Step 2: …").',
  'computer-science':
    'How computers work (input, processing, output, storage, memory), hardware and software, binary numbers and bits/bytes, storage units (KB, MB, GB), the internet and the web (IP address, browser, URL, email), algorithms and flowcharts, simple coding logic in plain pseudocode (loops, if/else, variables), data and files, and online safety (strong passwords, phishing). No company, product or app brand names. For code, use short plain pseudocode, not a real programming language.',
};

/**
 * The areas of each subject. Every drop takes 5 DIFFERENT areas (one per question),
 * and the window moves on with every drop, so day by day a category covers its
 * whole domain instead of circling the same few ideas.
 */
export const CATEGORY_AREAS: Record<string, string[]> = {
  english: [
    'word meanings (vocabulary)',
    'synonyms',
    'antonyms (opposites)',
    'tenses',
    'articles (a, an, the)',
    'prepositions',
    'subject–verb agreement',
    'commonly confused words',
    'idioms',
    'phrasal verbs',
    'spelling',
    'punctuation',
    'one-word substitutes',
    'active and passive voice',
    'direct and indirect speech',
    'sentence correction (error spotting)',
    'parts of speech',
    'collocations (words that go together)',
    'prefixes and suffixes',
    'formal vs informal English',
  ],
  reasoning: [
    'number series',
    'letter series',
    'analogies',
    'odd one out',
    'coding-decoding',
    'blood relations',
    'directions and distance',
    'syllogisms',
    'ranking and order',
    'seating arrangement',
    'clocks',
    'calendars',
    'statement and conclusion',
    'cause and effect',
    'mirror and water images (described in words)',
    'counting and grouping',
    'input–output patterns',
    'data sufficiency',
  ],
  puzzles: [
    'classic riddles',
    'number puzzles (missing number)',
    'magic squares',
    'age puzzles',
    'counting puzzles',
    'matchstick puzzles (described in words)',
    'anagrams',
    'hidden words',
    'word ladders',
    'logic grid puzzles',
    'truth-tellers and liars',
    'lateral thinking',
    'river-crossing puzzles',
    'weighing and balance puzzles',
    'calendar and clock puzzles',
    'cryptarithms (letters for digits)',
    'sequence of moves (e.g. pouring water)',
    'probability brain teasers',
  ],
  'computer-science': [
    'hardware parts (CPU, RAM, storage)',
    'input and output devices',
    'software and operating systems',
    'binary numbers',
    'bits, bytes and storage units',
    'memory vs storage',
    'how the internet works',
    'the web, browsers and URLs',
    'IP addresses and networks',
    'email and protocols',
    'algorithms',
    'flowcharts',
    'variables and data types',
    'loops',
    'if/else decisions',
    'functions',
    'searching and sorting',
    'files and folders',
    'databases',
    'online safety and passwords',
    'phishing and scams',
    'how apps and websites are built',
    'artificial intelligence basics',
    'logic gates (AND, OR, NOT)',
  ],
};

/** The 5 areas for one drop (5 different areas, rotating through the whole list over time). */
export function topicAreas(category: string, date: string, drop: number): string[] {
  const list = CATEGORY_AREAS[category] ?? [];
  if (list.length === 0) return [];
  const slot = daysBetween('2026-01-01', date) * DROPS_PER_DAY + (drop - 1);
  const start = (((slot * 5) % list.length) + list.length) % list.length;
  return Array.from(
    { length: Math.min(5, list.length) },
    (_, i) => list[(start + i) % list.length],
  );
}

export const SYSTEM_PROMPT = `You write quiz content for Learn5, a daily micro-learning app.
Readers are ordinary people, many weak in English. Write so a 12-year-old understands on the first read.

STYLE
- Simple English, short sentences (under 15 words). Common words; explain any technical word right away.
- Speak to the reader ("you"). Use everyday examples: cooking, shopping, travel, cricket, phones, money, weather, the body.
- Friendly and encouraging.

ALLOWED
- Only school-level, well-established facts (e.g. NCERT Classes 6–10, Britannica). Nothing that changes over time.
- NEVER: politics, religion, medical advice, caste, current events, prices, "latest" records, brand names, living people, controversial or disputed facts, trick questions.

QUESTIONS
- One idea per question, short and clear.
- MCQ: exactly 4 options of similar length and style. Wrong options believable but clearly wrong. Exactly one correct. No "All/None of the above".
- true_false: clearly true or clearly false, never "sometimes". options must be exactly ["True","False"].
- fill_blank: the question contains ___ (three underscores) where ONE word or number goes, which fits only one way. acceptedAnswers (optional) = OTHER spellings of the same answer (e.g. answer "20", acceptedAnswers ["twenty"]); never repeat the answer itself.
- fact_card: one surprising but true fact in 1–2 sentences ("fact" field, no question); the explanation adds the "why".
- explanation: 2–4 simple sentences (20–600 characters). Say why the right answer is right; when useful, why the tempting wrong answer is wrong.
- funFact (optional): one fun line, max 200 characters.
- source: a real, well-known reference for THIS subject that covers the fact: e.g. "NCERT Class 8 Mathematics" for math, "NCERT Class 9 Science" for science, "Oxford Learner's Dictionary" only for English words.
- topic: short name, max 60 characters. All 5 topics in a drop must be different.
- title: short and catchy, max 60 characters, about the TOPICS in this drop (e.g. "Bits, Bytes and Binary"). Never use the time of day, the date, the subject name or the words "quiz"/"drop" in the title.

FACT-CHECK every item privately before answering: work each answer out again from scratch (recompute every number) and make sure every wrong option is wrong. If unsure, use a different fact. Do not write your checking into the explanation.

OUTPUT: one JSON object only, no markdown:
{"title": string, "items": [item, item, item, item, item]}
Item shapes (no "id" field):
- {"type":"mcq","difficulty":"easy|medium|hard","topic":"…","question":"…","options":["…","…","…","…"],"answerIndex":0-3,"explanation":"…","funFact":"…","source":"…"}
- {"type":"true_false","difficulty":"…","topic":"…","question":"…","options":["True","False"],"answerIndex":0 or 1,"explanation":"…","source":"…"}
- {"type":"fill_blank","difficulty":"…","topic":"…","question":"… ___ …","answer":"…","acceptedAnswers":["…"],"explanation":"…","source":"…"}
- {"type":"fact_card","difficulty":"…","topic":"…","fact":"…","explanation":"…","source":"…"}`;

/** Item type for each of the 5 positions, varied per drop (fact cards fill the Flashcards deck). */
const PLANS: Record<number, string[]> = {
  1: ['mcq', 'true_false', 'mcq', 'fill_blank', 'mcq'],
  2: ['true_false', 'mcq', 'mcq', 'fact_card', 'mcq'],
  3: ['mcq', 'mcq', 'true_false', 'fill_blank', 'mcq'],
};
/** What each step of the difficulty ladder means (every question harder than the last). */
const LADDER_GUIDE = [
  'warm-up: most adults get it in 10 seconds',
  'needs a moment of thought or a basic school concept',
  'clearly harder than question 2: two steps of thinking or a less obvious fact',
  'challenging: several steps, or a fact that needs real understanding',
  'the hardest: only a well-prepared player gets it (still fair, still school-level, up to Class 10–12)',
];
const SLOT = ['morning (opens 4 AM)', 'afternoon (opens 4 PM)'];

export function userPrompt(opts: {
  category: Category;
  date: string;
  drop: number;
  /** The 5 areas of the subject to use, one per question, in order. */
  areas: string[];
  avoidTopics: string[];
  feedback?: string[];
}): string {
  const plan = PLANS[opts.drop] ?? PLANS[1];
  const lines = [
    `Write drop ${opts.drop} of ${DROPS_PER_DAY} (${SLOT[opts.drop - 1] ?? 'extra'}) for the category "${opts.category.name}" (${opts.category.tagline}) for ${opts.date}.`,
    `What to cover in ${opts.category.name}: ${CATEGORY_RULES[opts.category.id] ?? opts.category.tagline}`,
    '',
    'Exactly 5 items, in this order. They form a DIFFICULTY LADDER: every item must be harder than the one before it. Never make them all easy.',
    ...plan.map((type, i) => {
      const area = opts.areas[i] ? `, area: ${opts.areas[i]}` : '';
      return `  ${i + 1}. ${type}, difficulty "${DIFFICULTY_LADDER[i]}" — ${LADDER_GUIDE[i]}${area}`;
    }),
    'Each item comes from its OWN area of the subject (as listed), so the drop covers a wide range. The wording stays simple: the IDEA gets harder, not the English.',
    'The 3 mcq items must use at least 2 different answerIndex values.',
  ];
  if (opts.avoidTopics.length > 0) {
    lines.push(
      '',
      'Do NOT use these topics (or the same idea in other words) — they were used recently:',
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

export const VERIFY_SYSTEM_PROMPT = `You are a strict fact-checker for a school-level quiz app.
For each item check:
1. The marked answer is definitely correct (work it out from scratch; recompute every number).
2. For mcq: every other option is definitely wrong, and exactly one option is correct.
3. For true_false: the statement is clearly true or clearly false, and the marked answer matches.
4. For fill_blank: exactly one answer fits the blank, and it is the given answer. acceptedAnswers are just other spellings of that SAME answer (e.g. "12" and "twelve") — that is fine, not a second answer.
5. The explanation agrees with the answer and its facts and numbers are right.
6. The fact is well-established, school-level, not controversial, not time-sensitive.
7. The source is a real reference that fits the subject (e.g. not a dictionary for a math fact).
Be strict: if you have real doubt, mark it not ok.
Reply with JSON only: {"items":[{"position":1,"ok":true,"problem":""}, …]} — one entry per item, "problem" explains what is wrong when ok is false.`;
