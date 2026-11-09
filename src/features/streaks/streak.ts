/**
 * streak.ts — the daily streak 🔥
 *
 * Playing at least 1 drop on a day keeps the streak going. If you haven't
 * played yet today, yesterday's streak still counts until the day ends.
 * Days are the user's own calendar days ("YYYY-MM-DD", device clock).
 */
import { addDays } from '@/lib/dates';

export interface StreakInfo {
  current: number;
  best: number;
  playedToday: boolean;
}

export function computeStreak(playedDays: Iterable<string>, today: string): StreakInfo {
  const days = new Set(playedDays);
  const playedToday = days.has(today);

  // Current streak: count back from today (or from yesterday if not played yet today).
  let current = 0;
  let cursor = playedToday ? today : addDays(today, -1);
  while (days.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  // Best streak ever: longest run of consecutive days.
  let best = 0;
  for (const day of days) {
    if (days.has(addDays(day, -1))) continue; // not the start of a run
    let length = 1;
    while (days.has(addDays(day, length))) length++;
    best = Math.max(best, length);
  }

  return { current, best: Math.max(best, current), playedToday };
}
