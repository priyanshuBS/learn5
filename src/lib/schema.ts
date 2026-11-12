/**
 * schema.ts — the SINGLE SOURCE OF TRUTH for Learn5 content.
 *
 * Zod lets us describe the shape of our data once and then:
 *   1. check real files against it (scripts/validate-content.ts),
 *   2. check content downloaded by the app (src/lib/content.ts),
 *   3. get TypeScript types for free (z.infer<...>).
 *
 * If you change a rule here, the app, the validator and the future
 * API generator all follow it automatically.
 */
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Basic rules (constants)
// ─────────────────────────────────────────────────────────────

/** Every drop has exactly this many items. */
export const ITEMS_PER_DROP = 5;
/** Each category gets this many drops per day (morning, afternoon, evening). */
export const DROPS_PER_DAY = 3;
/**
 * Question tiers: every drop is written at 3 tiers, from Basic to Advanced.
 * Each player has their own tier per category and moves up as they answer well
 * (src/features/tiers/tiers.ts). Tier 1 is the original content.
 */
export const TIERS = [1, 2, 3] as const;
export const MAX_TIER = 3;
/** Required difficulty mix inside one drop, per tier (harder tiers have more hard items). */
export const TIER_DIFFICULTY_MIX = {
  1: { easy: 2, medium: 2, hard: 1 },
  2: { easy: 1, medium: 2, hard: 2 },
  3: { easy: 0, medium: 2, hard: 3 },
} as const satisfies Record<number, Record<'easy' | 'medium' | 'hard', number>>;
/** Difficulty mix of tier 1 (kept under its older name). */
export const DIFFICULTY_MIX = TIER_DIFFICULTY_MIX[1];
/** Required item-type mix inside one drop. */
export const TYPE_MIX = { mcq: 3, true_false: 1, fillOrFact: 1 } as const;
/** Fill-in-the-blank questions must show the gap with this marker. */
export const BLANK_MARKER = '___';

// ─────────────────────────────────────────────────────────────
// Small reusable pieces
// ─────────────────────────────────────────────────────────────

/** Lower-case id such as "physics" or "general-knowledge". */
export const SlugSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, 'Use lower-case letters, numbers and dashes only (e.g. "physics")');

/** Checks "YYYY-MM-DD" AND that the day really exists (no 2026-02-30). */
export function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export const DateStringSchema = z
  .string()
  .refine(isRealDate, 'Must be a real date written as YYYY-MM-DD');

/** "HH:MM" in 24-hour time, e.g. "07:30" or "19:00". */
export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be a 24-hour time written as HH:MM');

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export const ItemTypeSchema = z.enum(['mcq', 'true_false', 'fill_blank', 'fact_card']);

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} must not be empty`);

// ─────────────────────────────────────────────────────────────
// Items (the 4 kinds of question/card)
// ─────────────────────────────────────────────────────────────

/** Fields every item has, whatever its type. */
const baseItemFields = {
  id: z.string().regex(/^[a-z][a-z0-9-]*-\d{4}-\d{2}-\d{2}-d[1-3](-t[2-3])?-0[1-5]$/, {
    message: 'id must look like "english-2026-11-08-d1-01" (or "…-d1-t2-01" for tier 2)',
  }),
  difficulty: DifficultySchema,
  topic: nonEmpty('topic').max(60, 'topic should be short (max 60 characters)'),
  explanation: nonEmpty('explanation')
    .min(20, 'explanation is too short — write 2-4 simple sentences')
    .max(600, 'explanation is too long — keep it to 2-4 simple sentences'),
  funFact: nonEmpty('funFact').max(200).optional(),
  source: nonEmpty('source').min(3),
};

/** Multiple-choice question: exactly 4 different options, one correct. */
export const McqItemSchema = z
  .strictObject({
    ...baseItemFields,
    type: z.literal('mcq'),
    question: nonEmpty('question'),
    options: z.array(nonEmpty('option')).length(4, 'mcq must have exactly 4 options'),
    answerIndex: z.number().int().min(0).max(3),
  })
  .refine(
    (item) => new Set(item.options.map((o) => o.trim().toLowerCase())).size === item.options.length,
    { message: 'mcq options must all be different', path: ['options'] },
  );

/** True/false: options must be exactly ["True", "False"]. */
export const TrueFalseItemSchema = z.strictObject({
  ...baseItemFields,
  type: z.literal('true_false'),
  question: nonEmpty('question'),
  options: z.tuple([z.literal('True'), z.literal('False')], {
    message: 'true_false options must be exactly ["True", "False"]',
  }),
  answerIndex: z.number().int().min(0).max(1),
});

/**
 * Fill in the blank: the question shows "___" where the answer goes.
 * `acceptedAnswers` (optional) lists other spellings we also mark correct,
 * e.g. answer "25" with acceptedAnswers ["twenty-five"].
 */
export const FillBlankItemSchema = z
  .strictObject({
    ...baseItemFields,
    type: z.literal('fill_blank'),
    question: nonEmpty('question'),
    answer: nonEmpty('answer').max(40, 'fill_blank answer should be a short word or number'),
    acceptedAnswers: z.array(nonEmpty('accepted answer')).optional(),
  })
  .refine((item) => item.question.includes(BLANK_MARKER), {
    message: `fill_blank question must contain "${BLANK_MARKER}" where the answer goes`,
    path: ['question'],
  });

/** Fact card: something to read and remember. Uses "fact" instead of "question". */
export const FactCardItemSchema = z.strictObject({
  ...baseItemFields,
  type: z.literal('fact_card'),
  fact: nonEmpty('fact'),
});

export const ItemSchema = z.discriminatedUnion('type', [
  McqItemSchema,
  TrueFalseItemSchema,
  FillBlankItemSchema,
  FactCardItemSchema,
]);

// ─────────────────────────────────────────────────────────────
// A drop (one file = 5 items)
// ─────────────────────────────────────────────────────────────

/**
 * Builds the expected id of an item, e.g. "english-2026-11-08-d1-01".
 * Higher tiers add the tier: "english-2026-11-08-d1-t2-01".
 */
export function makeItemId(
  category: string,
  date: string,
  drop: number,
  position: number,
  tier = 1,
) {
  const t = tier > 1 ? `-t${tier}` : '';
  return `${category}-${date}-d${drop}${t}-${String(position).padStart(2, '0')}`;
}

export const DropSchema = z
  .strictObject({
    date: DateStringSchema,
    category: SlugSchema,
    drop: z.number().int().min(1).max(DROPS_PER_DAY),
    /** Question tier, 1 (Basic) to 3 (Advanced). Missing = 1. */
    tier: z.number().int().min(1).max(MAX_TIER).default(1),
    title: nonEmpty('title').max(60, 'title should be short and catchy (max 60 characters)'),
    items: z
      .array(ItemSchema)
      .length(ITEMS_PER_DROP, `a drop must have exactly ${ITEMS_PER_DROP} items`),
  })
  .superRefine((drop, ctx) => {
    // 1. Item ids must match the drop and be in order 01..05.
    drop.items.forEach((item, i) => {
      const expected = makeItemId(drop.category, drop.date, drop.drop, i + 1, drop.tier);
      if (item.id !== expected) {
        ctx.addIssue({
          code: 'custom',
          message: `item id should be "${expected}" but is "${item.id}"`,
          path: ['items', i, 'id'],
        });
      }
    });

    // 2. Item type mix: 3 mcq + 1 true_false + 1 (fill_blank OR fact_card).
    const count = (type: string) => drop.items.filter((it) => it.type === type).length;
    const mcq = count('mcq');
    const tf = count('true_false');
    const fillOrFact = count('fill_blank') + count('fact_card');
    if (mcq !== TYPE_MIX.mcq || tf !== TYPE_MIX.true_false || fillOrFact !== TYPE_MIX.fillOrFact) {
      ctx.addIssue({
        code: 'custom',
        message: `type mix must be 3 mcq + 1 true_false + 1 fill_blank/fact_card (found ${mcq} mcq, ${tf} true_false, ${fillOrFact} fill_blank/fact_card)`,
        path: ['items'],
      });
    }

    // 3. Difficulty mix for this tier (tier 1: 2 easy, 2 medium, 1 hard).
    const mix = TIER_DIFFICULTY_MIX[drop.tier as keyof typeof TIER_DIFFICULTY_MIX];
    for (const level of DifficultySchema.options) {
      const found = drop.items.filter((it) => it.difficulty === level).length;
      if (found !== mix[level]) {
        ctx.addIssue({
          code: 'custom',
          message: `tier ${drop.tier} needs ${mix[level]} "${level}" items but found ${found} (mix must be ${mix.easy} easy, ${mix.medium} medium, ${mix.hard} hard)`,
          path: ['items'],
        });
      }
    }

    // 4. No two items in the same drop may share a topic.
    const topics = drop.items.map((it) => it.topic.trim().toLowerCase());
    if (new Set(topics).size !== topics.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'two items in this drop use the same topic',
        path: ['items'],
      });
    }
  });

// ─────────────────────────────────────────────────────────────
// categories.json, schedule.config.json and index.json
// ─────────────────────────────────────────────────────────────

export const CategorySchema = z.strictObject({
  id: SlugSchema,
  name: nonEmpty('name'),
  emoji: nonEmpty('emoji'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a hex colour like "#3B82F6"'),
  tagline: nonEmpty('tagline').max(80),
});

export const CategoriesFileSchema = z
  .array(CategorySchema)
  .min(1)
  .refine((list) => new Set(list.map((c) => c.id)).size === list.length, {
    message: 'category ids must be unique',
  });

/** schedule.config.json — every scheduled-task time lives here. */
export const ScheduleConfigSchema = z.object({
  $comment: z.string().optional(),
  timezone: nonEmpty('timezone'),
  /** When each day's articles are written and shown (HH:MM, content time zone). */
  articles: TimeStringSchema.default('04:00'),
  drops: z.record(
    SlugSchema,
    z.array(TimeStringSchema).length(DROPS_PER_DAY, `each category needs ${DROPS_PER_DAY} times`),
  ),
});

/** One line in content/index.json describing a drop file. */
export const IndexEntrySchema = z.strictObject({
  category: SlugSchema,
  date: DateStringSchema,
  drop: z.number().int().min(1).max(DROPS_PER_DAY),
  title: nonEmpty('title'),
  /** Path relative to the content folder, e.g. "physics/2026-11-08/drop-1.json". */
  path: z.string(),
});

/** content/index.json — auto-generated by scripts/build-index.ts. */
export const ContentIndexSchema = z.strictObject({
  /** Changes whenever any content changes, so the app knows to refresh. */
  version: z.string(),
  latestDate: DateStringSchema.nullable(),
  timezone: z.string(),
  schedule: z.record(SlugSchema, z.array(TimeStringSchema)),
  categories: CategoriesFileSchema,
  drops: z.array(IndexEntrySchema),
});

// ─────────────────────────────────────────────────────────────
// Articles (one short read per category per day)
// ─────────────────────────────────────────────────────────────

/** Article length limits (words in the sections), so a read takes about 3–5 minutes. */
export const ARTICLE_WORDS = { min: 350, max: 750 } as const;

export const ArticleSectionSchema = z.strictObject({
  heading: nonEmpty('heading').max(70, 'heading should be short (max 70 characters)'),
  paragraphs: z
    .array(nonEmpty('paragraph').max(700, 'paragraph is too long — split it'))
    .min(1)
    .max(4),
});

/** A hard word from the article with a simple meaning. */
export const GlossaryEntrySchema = z.strictObject({
  word: nonEmpty('word').max(40),
  meaning: nonEmpty('meaning').max(160),
});

export const ArticleSchema = z.strictObject({
  category: SlugSchema,
  date: DateStringSchema,
  title: nonEmpty('title').max(70, 'title should be short (max 70 characters)'),
  topic: nonEmpty('topic').max(60, 'topic should be short (max 60 characters)'),
  /** One or two sentences shown in the list. */
  summary: nonEmpty('summary').max(220, 'summary should be one or two short sentences'),
  sections: z.array(ArticleSectionSchema).min(3).max(6),
  /** The main things to remember. */
  keyPoints: z.array(nonEmpty('key point').max(160)).min(3).max(5),
  /** Hard words explained simply. */
  glossary: z.array(GlossaryEntrySchema).max(6),
  source: nonEmpty('source').min(3),
  readingMinutes: z.number().int().min(1).max(15),
});

/** What the article list shows (no body). */
export const ArticleSummarySchema = ArticleSchema.pick({
  category: true,
  date: true,
  title: true,
  topic: true,
  summary: true,
  readingMinutes: true,
});

/** GET /api/articles */
export const ArticleIndexSchema = z.object({
  articles: z.array(ArticleSummarySchema),
});

// ─────────────────────────────────────────────────────────────
// TypeScript types (generated from the schemas above)
// ─────────────────────────────────────────────────────────────

export type Difficulty = z.infer<typeof DifficultySchema>;
export type ItemType = z.infer<typeof ItemTypeSchema>;
export type McqItem = z.infer<typeof McqItemSchema>;
export type TrueFalseItem = z.infer<typeof TrueFalseItemSchema>;
export type FillBlankItem = z.infer<typeof FillBlankItemSchema>;
export type FactCardItem = z.infer<typeof FactCardItemSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Drop = z.infer<typeof DropSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type ScheduleConfig = z.infer<typeof ScheduleConfigSchema>;
export type IndexEntry = z.infer<typeof IndexEntrySchema>;
export type ContentIndex = z.infer<typeof ContentIndexSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type ArticleSummary = z.infer<typeof ArticleSummarySchema>;
export type ArticleIndex = z.infer<typeof ArticleIndexSchema>;
