/**
 * Tests for drop paths with tiers (server side).
 */
import { describe, expect, it, jest } from '@jest/globals';

import { dropForApp, dropPath, parseDropPath } from '../drops';

jest.mock('../db', () => ({ getSql: () => () => [] }));

describe('drop paths', () => {
  it('reads tier 1 and higher-tier paths', () => {
    expect(parseDropPath('english/2026-11-08/drop-2.json')).toEqual({
      category: 'english',
      date: '2026-11-08',
      drop: 2,
      tier: 1,
    });
    expect(parseDropPath('computer-science/2026-11-08/drop-1-t3.json')).toMatchObject({
      category: 'computer-science',
      tier: 3,
    });
    expect(parseDropPath('english/2026-11-08/drop-1-t4.json')).toBeNull();
  });

  it('builds the same paths back', () => {
    expect(dropPath('english', '2026-11-08', 2)).toBe('english/2026-11-08/drop-2.json');
    expect(dropPath('english', '2026-11-08', 2, 3)).toBe('english/2026-11-08/drop-2-t3.json');
  });

  it('leaves "tier" out of tier-1 drops for older app versions', () => {
    const base = { category: 'english', date: '2026-11-08', drop: 1, title: 'T', items: [] };
    expect('tier' in dropForApp({ ...base, tier: 1 } as never)).toBe(false);
    expect(dropForApp({ ...base, tier: 2 } as never).tier).toBe(2);
  });
});
