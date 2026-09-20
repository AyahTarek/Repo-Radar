import { describe, expect, it } from 'vitest';
import { truncateLabel } from './truncateLabel';

describe('truncateLabel', () => {
  it('leaves labels that fit untouched', () => {
    expect(truncateLabel('react', 10)).toBe('react');
  });

  it('keeps the result within the budget, ellipsis included', () => {
    const truncated = truncateLabel('some-very-long-repository-name', 10);

    expect(truncated).toHaveLength(10);
    expect(truncated.endsWith('…')).toBe(true);
  });

  it('treats an exact fit as fitting', () => {
    expect(truncateLabel('abcde', 5)).toBe('abcde');
  });
});
