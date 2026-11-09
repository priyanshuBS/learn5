import { describe, expect, it } from '@jest/globals';

import type { ZonedNow } from '@/lib/time';
import { makeIndex } from '@/test-utils/fixtures';

import {
  dropKey,
  getCatchUpEntry,
  getNextOpening,
  getOpenEntries,
  getTodaySlots,
  isOpen,
  type DropRef,
} from '../drops/status';

const TODAY = '2026-11-08';
const at = (hhmm: string, date = TODAY): ZonedNow => {
  const [h, m] = hhmm.split(':').map(Number);
  return { date, minutes: h * 60 + m, offsetMinutes: 0 };
};
const nothingDone = () => false;

// Math has all 3 drops today and yesterday; drop 2 today is MISSING.
const index = makeIndex([
  { category: 'math', date: '2026-11-07', drop: 1 },
  { category: 'math', date: '2026-11-07', drop: 2 },
  { category: 'math', date: '2026-11-07', drop: 3 },
  { category: 'math', date: TODAY, drop: 1 },
  { category: 'math', date: TODAY, drop: 3 },
  { category: 'math', date: '2026-11-09', drop: 1 }, // future (tomorrow)
]);
const statuses = (now: ZonedNow, isDone: (r: DropRef) => boolean = nothingDone) =>
  getTodaySlots(index, 'math', now, isDone).map((s) => s.status);

describe('getTodaySlots', () => {
  it('before 7:00 the first drop is upcoming and the rest are locked', () => {
    expect(statuses(at('06:59'))).toEqual(['upcoming', 'locked', 'locked']);
  });

  it('opens a drop exactly at its time', () => {
    expect(statuses(at('07:00'))).toEqual(['available', 'upcoming', 'locked']);
  });

  it('marks a drop as missing when its time has passed but the file is not there', () => {
    expect(statuses(at('13:05'))).toEqual(['available', 'missing', 'upcoming']);
  });

  it('marks played drops as done', () => {
    const done = (r: DropRef) => dropKey(r) === `math/${TODAY}/1`;
    expect(statuses(at('20:00'), done)).toEqual(['done', 'missing', 'available']);
  });

  it('returns no slots for a category without a schedule', () => {
    expect(getTodaySlots(index, 'unknown', at('12:00'), nothingDone)).toEqual([]);
  });
});

describe('isOpen', () => {
  it('opens past days, keeps future days closed', () => {
    expect(isOpen(index, { category: 'math', date: '2026-11-07', drop: 3 }, at('00:00'))).toBe(
      true,
    );
    expect(isOpen(index, { category: 'math', date: '2026-11-09', drop: 1 }, at('23:59'))).toBe(
      false,
    );
  });

  it('opens today’s drops at their scheduled time', () => {
    const drop3 = { category: 'math', date: TODAY, drop: 3 };
    expect(isOpen(index, drop3, at('18:59'))).toBe(false);
    expect(isOpen(index, drop3, at('19:00'))).toBe(true);
  });
});

describe('archive and catch-up', () => {
  it('lists only open drops, newest first', () => {
    const paths = getOpenEntries(index, 'math', at('08:00')).map((e) => `${e.date}/${e.drop}`);
    expect(paths).toEqual(['2026-11-08/1', '2026-11-07/3', '2026-11-07/2', '2026-11-07/1']);
  });

  it('offers the newest open drop not yet played', () => {
    const done = (r: DropRef) => r.date === TODAY && r.drop === 1;
    expect(getCatchUpEntry(index, 'math', at('13:05'), done)).toMatchObject({
      date: '2026-11-07',
      drop: 3,
    });
  });

  it('offers nothing when everything open is played', () => {
    expect(getCatchUpEntry(index, 'math', at('08:00'), () => true)).toBeNull();
  });
});

describe('getNextOpening', () => {
  it('finds the next time today', () => {
    expect(getNextOpening(index, at('07:10'))).toEqual({ time: '07:30', tomorrow: false });
  });

  it('rolls over to tomorrow morning after the last drop', () => {
    expect(getNextOpening(index, at('21:00'))).toEqual({ time: '07:00', tomorrow: true });
  });
});
