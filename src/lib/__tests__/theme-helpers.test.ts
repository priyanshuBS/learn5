import { describe, expect, it } from '@jest/globals';

import { categoryTone, colors, darken, inkOn, lighten, withAlpha } from '@/theme';

import { longDate } from '../time';

describe('colour helpers', () => {
  it('lightens towards white', () => {
    expect(lighten('#000000', 0.5)).toBe('#808080');
    expect(lighten('#2563EB', 0)).toBe('#2563eb');
    expect(lighten('#2563EB', 1)).toBe('#ffffff');
  });

  it('shows every subject in ink (monochrome theme): light grey on dark, dark grey on light', () => {
    expect(categoryTone('#2563EB', true)).toBe('#E5E5E5');
    expect(categoryTone('#F59E0B', false)).toBe('#262626');
  });

  it('turns black ink white in dark mode and leaves other colours alone', () => {
    expect(inkOn(colors.brand, true)).toBe(colors.brandOnDark);
    expect(inkOn(colors.brand, false)).toBe(colors.brand);
    expect(inkOn(colors.success, true)).toBe(colors.success);
  });

  it('darkens towards black', () => {
    expect(darken('#FFFFFF', 0.5)).toBe('#808080');
    expect(darken('#2563EB', 0)).toBe('#2563eb');
  });

  it('adds transparency', () => {
    expect(withAlpha('#FF0000', 0.2)).toBe('#FF000033');
  });
});

describe('longDate', () => {
  it('writes the full weekday and month', () => {
    expect(longDate('2026-11-09')).toBe('Monday, 9 November');
  });
});
