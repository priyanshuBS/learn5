/**
 * Tests for topic areas: every drop uses 5 different areas of its subject, and
 * the areas move on with every drop so the whole subject is covered over time.
 */
import { describe, expect, it } from '@jest/globals';

import { CATEGORY_AREAS, topicAreas } from '../../../scripts/lib/prompt';
import categories from '../../../content/categories.json';

describe('topicAreas', () => {
  it('has areas for every category', () => {
    for (const c of categories) expect(CATEGORY_AREAS[c.id]?.length ?? 0).toBeGreaterThan(10);
  });

  it('gives 5 different areas per drop', () => {
    const areas = topicAreas('english', '2026-11-12', 1);
    expect(new Set(areas).size).toBe(5);
  });

  it('moves on between drops and covers every area within a few days', () => {
    expect(topicAreas('english', '2026-11-12', 1)).not.toEqual(
      topicAreas('english', '2026-11-12', 2),
    );
    const seen = new Set<string>();
    for (let d = 10; d < 20; d++) {
      for (const drop of [1, 2]) {
        for (const a of topicAreas('computer-science', `2026-11-${d}`, drop)) seen.add(a);
      }
    }
    expect(seen.size).toBe(CATEGORY_AREAS['computer-science'].length);
  });
});
