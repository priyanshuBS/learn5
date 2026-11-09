/// <reference types="node" />
/**
 * prompt.ts — what we ask the AI to write, and how we ask it to fact-check.
 *
 * This is a short version of CONTENT_GUIDE.md (the full rulebook for people).
 * If you change a rule there, change it here too. The hard rules are ALSO
 * checked in code (src/lib/schema.ts + generate-drops.ts), so a bad drop is
 * never saved even if the AI ignores the instructions.
 */
import type { Category } from '../../src/lib/schema';

const CATEGORY_RULES: Record<string, string> = {
  english:
    'Vocabulary (meanings, synonyms, opposites), grammar, common mistakes (its/it’s, advice/advise), idioms and phrases, correct word usage. Show the word inside a short example sentence.',
  math: 'Mental math tricks, everyday math (percentages, discounts, simple and compound interest, ratios, averages, time and speed, unit conversion), basic concepts (fractions, primes, area). Show ONE clear step-by-step working in the explanation (not two methods). Use ₹ for money.',
  reasoning:
    'Logic puzzles, number and letter series, analogies, coding-decoding, odd one out, directions, blood relations, simple syllogisms. The explanation MUST solve it step by step ("Step 1: … Step 2: …").',
  physics:
    'Motion, force, energy, work, gravity, light, sound, heat, electricity, magnetism, simple machines — linked to daily life.',
  chemistry:
    'Matter, atoms and molecules, elements and the periodic table, acids, bases and salts, metals and non-metals, everyday reactions (rusting, cooking, cleaning). No instructions for dangerous experiments.',
  'computer-science':
    'How computers work (input, processing, output, storage, memory), hardware and software, binary numbers and bits/bytes, storage units (KB, MB, GB), the internet and the web (IP address, browser, URL, email), algorithms and flowcharts, simple coding logic in plain pseudocode (loops, if/else, variables), data and files, and online safety (strong passwords, phishing). No company, product or app brand names. For code, use short plain pseudocode, not a real programming language.',
  biology:
    'Cells, the human body, plants, animals, food and nutrition (as science, not diet advice), ecosystems, microorganisms. No medical advice.',
};

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
const DIFFICULTY = ['easy', 'easy', 'medium', 'medium', 'hard'];
const SLOT = ['morning', 'afternoon', 'evening'];

export function userPrompt(opts: {
  category: Category;
  date: string;
  drop: number;
  avoidTopics: string[];
  feedback?: string[];
}): string {
  const plan = PLANS[opts.drop] ?? PLANS[1];
  const lines = [
    `Write drop ${opts.drop} of 3 (${SLOT[opts.drop - 1]}) for the category "${opts.category.name}" (${opts.category.tagline}) for ${opts.date}.`,
    `What to cover in ${opts.category.name}: ${CATEGORY_RULES[opts.category.id] ?? opts.category.tagline}`,
    '',
    'Exactly 5 items, in this order:',
    ...plan.map((type, i) => `  ${i + 1}. ${type}, ${DIFFICULTY[i]}`),
    'Difficulty: easy = most adults know it in 10 seconds; medium = needs a moment or a basic school concept; hard = a few steps of thinking or a less common (still school-level) fact.',
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
