/**
 * schema.ts — the shape of progress data sent between the app and the server
 * (POST /api/progress/sync). Shared by both, so they always agree.
 */
import { z } from 'zod';

import {
  DateStringSchema,
  DifficultySchema,
  ItemTypeSchema,
  MAX_DROP_NO,
  SlugSchema,
} from '@/lib/schema';

/** Most items accepted in one sync (bigger backlogs are sent in several rounds). */
export const SYNC_BATCH_LIMIT = 200;

const IsoTime = z.iso.datetime({ offset: true });

export const ItemResultSchema = z.object({
  itemId: z.string().min(1).max(100),
  type: ItemTypeSchema,
  difficulty: DifficultySchema,
  correct: z.boolean(),
  given: z.string().max(300).nullable(),
});

export const DropResultSchema = z.object({
  category: SlugSchema,
  date: DateStringSchema,
  drop: z.number().int().min(1).max(MAX_DROP_NO),
  title: z.string().min(1).max(120),
  items: z.array(ItemResultSchema).min(1).max(10),
  correctCount: z.number().int().min(0),
  points: z.number().int().min(0),
  perfect: z.boolean(),
  durationSec: z
    .number()
    .int()
    .min(0)
    .max(7 * 24 * 3600),
  completedAt: IsoTime,
  completedOn: DateStringSchema,
});

export const WrongAnswerReportSchema = z.object({
  itemId: z.string().min(1).max(100),
  dropKey: z.string().min(1).max(100),
  reportedAt: IsoTime,
});

export const SyncRequestSchema = z.object({
  /** The `cursor` from the last successful sync (null = send me everything). */
  since: IsoTime.nullable(),
  results: z.array(DropResultSchema).max(SYNC_BATCH_LIMIT),
  /** itemId → when it was fixed. */
  fixedMistakes: z
    .record(z.string().min(1).max(100), IsoTime)
    .refine((r) => Object.keys(r).length <= SYNC_BATCH_LIMIT, 'Too many fixed mistakes'),
  reports: z.array(WrongAnswerReportSchema).max(SYNC_BATCH_LIMIT),
});

export const SyncResponseSchema = z.object({
  results: z.array(DropResultSchema),
  fixedMistakes: z.record(z.string(), IsoTime),
  reports: z.array(WrongAnswerReportSchema),
  /** Send this back as `since` next time. */
  cursor: IsoTime,
});

export type SyncRequest = z.infer<typeof SyncRequestSchema>;
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
