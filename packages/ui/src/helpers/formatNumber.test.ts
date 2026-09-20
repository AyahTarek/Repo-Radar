import { describe, expect, it } from 'vitest';
import { formatCompact } from './formatNumber';

describe('formatCompact', () => {
  it.each([
    [0, '0'],
    [942, '942'],
    [1000, '1K'],
    [12_400, '12.4K'],
    [231_000, '231K'],
    [1_500_000, '1.5M'],
  ])('formats %i as %s', (input, expected) => {
    expect(formatCompact(input)).toBe(expected);
  });

  it('keeps small numbers exact, since 999 open issues is not "1K"', () => {
    expect(formatCompact(999)).toBe('999');
  });
});
