import { describe, expect, it } from '@jest/globals';

import { clientIp } from '../http';

const req = (headers: Record<string, string>) =>
  new Request('https://learn5.test/api', { headers });

describe('clientIp', () => {
  it('prefers the CDN header', () => {
    expect(clientIp(req({ 'cf-connecting-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' }))).toBe(
      '1.2.3.4',
    );
  });

  it('takes the first address from x-forwarded-for', () => {
    expect(clientIp(req({ 'x-forwarded-for': '5.6.7.8, 10.0.0.1' }))).toBe('5.6.7.8');
  });

  it('is null when unknown (local development)', () => {
    expect(clientIp(req({}))).toBeNull();
  });

  it('ignores absurdly long values', () => {
    expect(clientIp(req({ 'x-real-ip': 'x'.repeat(200) }))).toBeNull();
  });
});
