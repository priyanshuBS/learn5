/**
 * progress.ts — SERVER ONLY. Saves and returns a user's learning progress.
 *
 * One call does both directions (see app/api/progress/sync+api.ts):
 *   1. save what the phone sends (new results, fixed mistakes, reports),
 *   2. return everything saved since the phone's last sync (from any device).
 *
 * Each list is saved with ONE query (a JSON array turned into rows), so a
 * sync costs the same few queries whether it carries 1 result or 200.
 */
import { dropKey } from '@/features/drops/status';
import { scoreDrop } from '@/features/points/points';
import type { SyncRequest, SyncResponse } from '@/features/progress/schema';
import type { DropResult } from '@/features/progress/store';

import { getSql } from './db';

/**
 * Rows saved just before a sync's cursor may become visible a moment later,
 * so each pull looks a little further back. Duplicates are harmless (the app merges by key).
 */
const CURSOR_OVERLAP = '2 minutes';

const iso = (value: unknown) => new Date(value as string).toISOString();

export async function syncProgress(userId: string, input: SyncRequest): Promise<SyncResponse> {
  const sql = getSql();

  // ── 1. Save ──
  if (input.results.length > 0) {
    // Points are worked out again here, so they always follow the scoring rules.
    const rows = input.results.map((r) => {
      const score = scoreDrop(r.items);
      return {
        drop_key: dropKey(r),
        category: r.category,
        drop_date: r.date,
        drop_no: r.drop,
        title: r.title,
        items: r.items,
        correct_count: score.correctCount,
        points: score.total,
        perfect: score.perfect,
        duration_sec: r.durationSec,
        completed_at: r.completedAt,
        completed_on: r.completedOn,
      };
    });
    // ON CONFLICT DO NOTHING: the first play of a drop is kept (replays are practice).
    await sql`
      INSERT INTO drop_results (user_id, drop_key, category, drop_date, drop_no, title, items,
                                correct_count, points, perfect, duration_sec, completed_at, completed_on)
      SELECT ${userId}::uuid, x.drop_key, x.category, x.drop_date::date, x.drop_no, x.title, x.items,
             x.correct_count, x.points, x.perfect, x.duration_sec, x.completed_at::timestamptz,
             x.completed_on::date
      FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS x(
        drop_key text, category text, drop_date text, drop_no smallint, title text, items jsonb,
        correct_count smallint, points integer, perfect boolean, duration_sec integer,
        completed_at text, completed_on text)
      ON CONFLICT (user_id, drop_key) DO NOTHING`;
  }

  const fixed = Object.entries(input.fixedMistakes).map(([item_id, fixed_at]) => ({
    item_id,
    fixed_at,
  }));
  if (fixed.length > 0) {
    await sql`
      INSERT INTO fixed_mistakes (user_id, item_id, fixed_at)
      SELECT ${userId}::uuid, x.item_id, x.fixed_at::timestamptz
      FROM jsonb_to_recordset(${JSON.stringify(fixed)}::jsonb) AS x(item_id text, fixed_at text)
      ON CONFLICT (user_id, item_id) DO NOTHING`;
  }

  if (input.reports.length > 0) {
    const reports = input.reports.map((r) => ({
      item_id: r.itemId,
      drop_key: r.dropKey,
      reported_at: r.reportedAt,
    }));
    await sql`
      INSERT INTO answer_reports (user_id, item_id, drop_key, reported_at)
      SELECT DISTINCT ON (x.item_id) ${userId}::uuid, x.item_id, x.drop_key, x.reported_at::timestamptz
      FROM jsonb_to_recordset(${JSON.stringify(reports)}::jsonb)
        AS x(item_id text, drop_key text, reported_at text)
      ON CONFLICT (user_id, item_id) DO NOTHING`;
  }

  // ── 2. Return what changed since the last sync ──
  const since = input.since;
  const [[clock], resultRows, fixedRows, reportRows] = await Promise.all([
    sql`SELECT now() AS now`,
    sql`
      SELECT category, drop_date::text AS date, drop_no, title, items, correct_count, points,
             perfect, duration_sec, completed_at, completed_on::text AS completed_on
      FROM drop_results
      WHERE user_id = ${userId}
        AND (${since}::timestamptz IS NULL
             OR synced_at > ${since}::timestamptz - ${CURSOR_OVERLAP}::interval)`,
    sql`
      SELECT item_id, fixed_at FROM fixed_mistakes
      WHERE user_id = ${userId}
        AND (${since}::timestamptz IS NULL
             OR synced_at > ${since}::timestamptz - ${CURSOR_OVERLAP}::interval)`,
    sql`
      SELECT item_id, drop_key, reported_at FROM answer_reports
      WHERE user_id = ${userId}
        AND (${since}::timestamptz IS NULL
             OR synced_at > ${since}::timestamptz - ${CURSOR_OVERLAP}::interval)`,
  ]);

  const results: DropResult[] = resultRows.map((row) => ({
    category: row.category,
    date: row.date,
    drop: row.drop_no,
    title: row.title,
    items: row.items,
    correctCount: row.correct_count,
    points: row.points,
    perfect: row.perfect,
    durationSec: row.duration_sec,
    completedAt: iso(row.completed_at),
    completedOn: row.completed_on,
  }));

  return {
    results,
    fixedMistakes: Object.fromEntries(fixedRows.map((r) => [r.item_id, iso(r.fixed_at)])),
    reports: reportRows.map((r) => ({
      itemId: r.item_id,
      dropKey: r.drop_key,
      reportedAt: iso(r.reported_at),
    })),
    cursor: iso(clock.now),
  };
}
