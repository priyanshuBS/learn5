import { describe, expect, it } from '@jest/globals';

import { displayTitle } from '@/lib/title';

describe('displayTitle', () => {
  it('drops a trailing date and the dash before it', () => {
    expect(displayTitle('Evening Physics Quiz – 2026-11-09')).toBe('Evening Physics Quiz');
    expect(displayTitle('Evening Reasoning Drop - 2026-11-09')).toBe('Evening Reasoning Drop');
    expect(displayTitle('Morning English Boost (2026-11-10)')).toBe('Morning English Boost');
  });

  it('leaves normal titles alone', () => {
    expect(displayTitle('Speed, Time and Distance')).toBe('Speed, Time and Distance');
    expect(displayTitle("Cells: Life's Building Blocks")).toBe("Cells: Life's Building Blocks");
  });

  it('never returns an empty title', () => {
    expect(displayTitle('2026-11-09')).toBe('2026-11-09');
  });
});
