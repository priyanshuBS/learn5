/**
 * status.ts — decides whether each drop is upcoming, locked, available, done or missing.
 *
 *   upcoming  → the next drop to open today (we show "opens at 1:00 PM")
 *   locked    → opens later today, after the upcoming one
 *   available → open now and ready to play
 *   done      → already played
 *   missing   → its time has passed but the file isn't there yet
 *               (e.g. the computer was off). We then offer the latest
 *               available drop instead — never a blank screen.
 */
import type { ContentIndex, IndexEntry } from '@/lib/schema';
import { timeToMinutes, type ZonedNow } from '@/lib/time';

export type SlotStatus = 'upcoming' | 'locked' | 'available' | 'done' | 'missing';

export interface DropRef {
  category: string;
  date: string;
  drop: number;
}

export interface DropSlot {
  category: string;
  drop: number;
  /** Opening time in the content time zone, "HH:MM". */
  time: string;
  status: SlotStatus;
  /** The drop file for today, if it exists. */
  entry: IndexEntry | null;
}

export const SLOT_NAMES = ['Morning', 'Afternoon', 'Evening'] as const;

/** A short unique key for a drop, e.g. "math/2026-11-08/2". */
export function dropKey(ref: DropRef): string {
  return `${ref.category}/${ref.date}/${ref.drop}`;
}

/** Finds a drop in the index. */
export function findEntry(index: ContentIndex, ref: DropRef): IndexEntry | null {
  return (
    index.drops.find(
      (d) => d.category === ref.category && d.date === ref.date && d.drop === ref.drop,
    ) ?? null
  );
}

/** True when a drop may be played now (its day and time have arrived). */
export function isOpen(index: ContentIndex, ref: DropRef, now: ZonedNow): boolean {
  if (ref.date < now.date) return true;
  if (ref.date > now.date) return false;
  const time = index.schedule[ref.category]?.[ref.drop - 1];
  return !time || now.minutes >= timeToMinutes(time);
}

/** Today's 3 drop slots for one category. */
export function getTodaySlots(
  index: ContentIndex,
  category: string,
  now: ZonedNow,
  isDone: (ref: DropRef) => boolean,
): DropSlot[] {
  const times = index.schedule[category] ?? [];
  let upcomingGiven = false;

  return times.map((time, i) => {
    const ref = { category, date: now.date, drop: i + 1 };
    const entry = findEntry(index, ref);
    let status: SlotStatus;
    if (entry && isDone(ref)) {
      status = 'done';
    } else if (now.minutes < timeToMinutes(time)) {
      status = upcomingGiven ? 'locked' : 'upcoming';
      upcomingGiven = true;
    } else {
      status = entry ? 'available' : 'missing';
    }
    return { category, drop: i + 1, time, status, entry };
  });
}

/** All drops of a category that are open now, newest first. */
export function getOpenEntries(index: ContentIndex, category: string, now: ZonedNow): IndexEntry[] {
  return index.drops
    .filter((d) => d.category === category && isOpen(index, d, now))
    .sort((a, b) => b.date.localeCompare(a.date) || b.drop - a.drop);
}

/** The newest open drop not yet played — used when today's drop is missing. */
export function getCatchUpEntry(
  index: ContentIndex,
  category: string,
  now: ZonedNow,
  isDone: (ref: DropRef) => boolean,
): IndexEntry | null {
  return getOpenEntries(index, category, now).find((e) => !isDone(e)) ?? null;
}

/** When the next drop opens (content time zone), today or tomorrow. */
export function getNextOpening(
  index: ContentIndex,
  now: ZonedNow,
): { time: string; tomorrow: boolean } | null {
  const allTimes = Object.values(index.schedule)
    .flat()
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  if (allTimes.length === 0) return null;
  const later = allTimes.find((t) => timeToMinutes(t) > now.minutes);
  return later ? { time: later, tomorrow: false } : { time: allTimes[0], tomorrow: true };
}
