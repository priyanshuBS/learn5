import { describe, expect, it } from '@jest/globals';

import { EmailSchema, normalizeEmail, OtpCodeSchema } from '../rules';

describe('auth rules', () => {
  it('normalizes emails so the same person always matches', () => {
    expect(normalizeEmail('  Asha@Mail.COM ')).toBe('asha@mail.com');
    expect(EmailSchema.parse(' Asha@Mail.com')).toBe('asha@mail.com');
  });

  it('rejects invalid emails', () => {
    for (const bad of ['', 'asha', 'asha@', '@mail.com', 'a b@mail.com']) {
      expect(EmailSchema.safeParse(bad).success).toBe(false);
    }
  });

  it('accepts only 6-digit codes', () => {
    expect(OtpCodeSchema.safeParse('012345').success).toBe(true);
    expect(OtpCodeSchema.safeParse(' 123456 ').success).toBe(true);
    for (const bad of ['12345', '1234567', '12a456', '']) {
      expect(OtpCodeSchema.safeParse(bad).success).toBe(false);
    }
  });
});
