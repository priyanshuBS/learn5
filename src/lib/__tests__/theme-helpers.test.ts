import { describe, expect, it } from '@jest/globals';

import { categoryTone, darken, lighten, withAlpha } from '@/theme';

import { longDate } from '../time';

describe('colour helpers', () => {
  it('lightens towards white', () => {
    expect(lighten('#000000', 0.5)).toBe('#808080');
    expect(lighten('#2563EB', 0)).toBe('#2563eb');
    expect(lighten('#2563EB', 1)).toBe('#ffffff');
  });

  it('makes category colours lighter in dark mode and a little darker in light mode', () => {
    expect(categoryTone('#2563EB', true)).toBe(lighten('#2563EB', 0.25));
    expect(categoryTone('#2563EB', false)).toBe(darken('#2563EB', 0.12));
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
