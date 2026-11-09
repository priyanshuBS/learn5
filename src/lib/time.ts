/**
 * time.ts — clock helpers.
 *
 * Drop times in schedule.config.json are in the content time zone
 * (Asia/Kolkata). A user in another country should still see drops open at
 * the right moment, so we work out "now" in that time zone, plus the
 * difference to the user's own clock for showing times.
 */
import { daysBetween, toDateString } from './dates';
import { isRealDate } from './schema';

export interface ZonedNow {
  /** Today's date in the content time zone, "YYYY-MM-DD". */
  date: string;
  /** Minutes since midnight in the content time zone (0–1439). */
  minutes: number;
  /** User's clock minus content clock, in minutes (0 for users in India). */
  offsetMinutes: number;
}

const MINUTES_PER_DAY = 24 * 60;

/** "07:30" → 450 */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Works out "now" in the given time zone. Falls back to the device clock if needed. */
export function getZonedNow(timeZone: string, now: Date = new Date()): ZonedNow {
  const localDate = toDateString(now);
  const localMinutes = now.getHours() * 60 + now.getMinutes();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const date = `${get('year')}-${get('month')}-${get('day')}`;
    const hour = Number(get('hour')) % 24;
    const minute = Number(get('minute'));
    if (!isRealDate(date) || Number.isNaN(hour) || Number.isNaN(minute)) {
      throw new Error('Unexpected date format');
    }
    const minutes = hour * 60 + minute;
    const offsetMinutes = daysBetween(date, localDate) * MINUTES_PER_DAY + localMinutes - minutes;
    return { date, minutes, offsetMinutes };
  } catch {
    // Very old devices without time-zone support: use the phone's own clock.
    return { date: localDate, minutes: localMinutes, offsetMinutes: 0 };
  }
}

/** 450 → "7:30 AM" (always a 12-hour clock, simple for everyone). */
export function formatClock(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m % 60).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
}

/** Shows a content-time-zone time ("07:30") on the user's own clock. */
export function localClockLabel(hhmm: string, offsetMinutes: number): string {
  return formatClock(timeToMinutes(hhmm) + offsetMinutes);
}

/** 185 → "3m 05s" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-07" → "Today", "Yesterday" or "Sat, 7 Nov" */
export function friendlyDate(date: string, today: string): string {
  const diff = daysBetween(date, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  const [y, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${d} ${MONTHS[m - 1]}`;
}

const LONG_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "2026-11-09" → "Monday, 9 November" */
export function longDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${LONG_WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${d} ${LONG_MONTHS[m - 1]}`;
}

/** Greeting for the Home screen, based on the user's own clock. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
