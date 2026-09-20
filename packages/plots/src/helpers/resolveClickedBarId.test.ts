import { describe, expect, it } from 'vitest';
import { resolveClickedBarId } from './resolveClickedBarId';

describe('resolveClickedBarId', () => {
  it('returns the id at the clicked index', () => {
    expect(resolveClickedBarId(['facebook/react', 'vuejs/core'], 1)).toBe('vuejs/core');
  });

  it('returns undefined for an out-of-range index', () => {
    expect(resolveClickedBarId(['facebook/react'], 5)).toBeUndefined();
  });
});
