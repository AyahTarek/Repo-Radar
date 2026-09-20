import { describe, expect, it } from 'vitest';
import { DEFAULT_TRACKED_SORT } from '../constants';
import { parseTrackedSortParam } from './sortParam';

describe('parseTrackedSortParam', () => {
  it('accepts every advertised option', () => {
    expect(parseTrackedSortParam('recently-tracked')).toBe('recently-tracked');
    expect(parseTrackedSortParam('name')).toBe('name');
  });

  it.each([['an unknown value', 'NOTREAL'], ['an empty value', ''], ['nothing', null]])(
    'falls back to the default for %s',
    (_label, input) => {
      expect(parseTrackedSortParam(input)).toBe(DEFAULT_TRACKED_SORT);
    },
  );
});
