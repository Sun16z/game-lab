import { describe, expect, it } from 'vitest';
import { challengeTarget, challengeCopy } from './challenge';
import { languages } from './i18n';
describe('challenge links', () => {
  it('accepts a bounded whole number and rejects malformed targets', () => {
    expect(challengeTarget('12')).toBe(12);
    for (const value of [null, '', '0', '-1', '2.5', '100000', '1x']) expect(challengeTarget(value)).toBeUndefined();
  });
  it('shows the target in every supported language', () => {
    for (const locale of languages) expect(challengeCopy[locale](12)).toContain('12');
  });
});
