/**
 * The Groq keys are used in order: groq-1 first, groq-2 as the fallback.
 */
import { describe, expect, it, jest } from '@jest/globals';

import { groqKeys } from '../../../scripts/lib/groq';

jest.mock('../../../scripts/lib/alerts', () => ({ notifyKeyLimit: jest.fn() }));

describe('groqKeys', () => {
  it('lists groq-1 then groq-2', () => {
    expect(groqKeys({ GROQ_API_KEY: 'a', GROQ_API_KEY_2: 'b' })).toEqual([
      { label: 'groq-1', value: 'a' },
      { label: 'groq-2', value: 'b' },
    ]);
  });

  it('skips a missing or empty fallback', () => {
    expect(groqKeys({ GROQ_API_KEY: 'a', GROQ_API_KEY_2: '  ' }).map((k) => k.label)).toEqual([
      'groq-1',
    ]);
  });
});
