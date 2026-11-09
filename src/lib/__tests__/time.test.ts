import { describe, expect, it } from '@jest/globals';

import {
  formatClock,
  formatDuration,
  friendlyDate,
  getZonedNow,
  localClockLabel,
  timeToMinutes,
} from '../time';

describe('getZonedNow', () => {
  // 08:40 UTC on 8 Nov 2026 = 14:10 in India (UTC+5:30)
  const instant = new Date(Date.UTC(2026, 10, 8, 8, 40));

  it('gives the date and time in India, whatever the computer’s time zone', () => {
    const now = getZonedNow('Asia/Kolkata', instant);
    expect(now.date).toBe('2026-11-08');
    expect(now.minutes).toBe(14 * 60 + 10);
  });

  it('handles a different day in another time zone', () => {
    // 05:00 UTC on 8 Nov is still 7 Nov, 9:00 PM in Los Angeles (UTC-8)
    expect(getZonedNow('America/Los_Angeles', new Date(Date.UTC(2026, 10, 8, 5, 0)))).toMatchObject(
      { date: '2026-11-07', minutes: 21 * 60 },
    );
    // ...and 20:40 UTC on 7 Nov is already 8 Nov in India
    expect(getZonedNow('Asia/Kolkata', new Date(Date.UTC(2026, 10, 7, 20, 40)))).toMatchObject({
      date: '2026-11-08',
      minutes: 2 * 60 + 10,
    });
  });

  it('converts India drop times to the device clock', () => {
    const now = getZonedNow('Asia/Kolkata', instant);
    const deviceMinutes = instant.getHours() * 60 + instant.getMinutes();
    // "14:10" India time is exactly "now", so it must show the device's current time.
    expect(localClockLabel('14:10', now.offsetMinutes)).toBe(formatClock(deviceMinutes));
  });

  it('falls back to the device clock for an unknown time zone', () => {
    const now = getZonedNow('Not/AZone', instant);
    expect(now.offsetMinutes).toBe(0);
  });
});

describe('formatting', () => {
  it('formats a 12-hour clock', () => {
    expect(formatClock(timeToMinutes('07:30'))).toBe('7:30 AM');
    expect(formatClock(timeToMinutes('00:05'))).toBe('12:05 AM');
    expect(formatClock(timeToMinutes('12:00'))).toBe('12:00 PM');
    expect(formatClock(timeToMinutes('21:30'))).toBe('9:30 PM');
    expect(formatClock(-30)).toBe('11:30 PM'); // wraps around midnight
  });

  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(185)).toBe('3m 05s');
  });

  it('shows friendly dates', () => {
    expect(friendlyDate('2026-11-08', '2026-11-08')).toBe('Today');
    expect(friendlyDate('2026-11-07', '2026-11-08')).toBe('Yesterday');
    expect(friendlyDate('2026-11-01', '2026-11-08')).toBe('Sun, 1 Nov');
  });
});
