import { describe, expect, it } from 'vitest';
import { DEFAULT_REPO_SORT, MAX_QUERY_LENGTH } from '../constants';
import { parseQueryParam, parseSortParam } from './searchParams';

describe('parseQueryParam', () => {
  it('keeps a normal query and trims whitespace', () => {
    expect(parseQueryParam('  react  ')).toBe('react');
  });

  it('treats a missing parameter as no query', () => {
    expect(parseQueryParam(null)).toBe('');
  });

  it('caps an oversized query, which GitHub would reject outright', () => {
    const parsed = parseQueryParam('x'.repeat(MAX_QUERY_LENGTH * 4));

    expect(parsed).toHaveLength(MAX_QUERY_LENGTH);
  });
});

describe('parseSortParam', () => {
  it('accepts every advertised option', () => {
    expect(parseSortParam('stars')).toBe('stars');
    expect(parseSortParam('updated')).toBe('updated');
  });

  it.each([['an unknown value', 'NOTREAL'], ['an empty value', ''], ['nothing', null]])(
    'falls back to the default for %s',
    (_label, input) => {
      expect(parseSortParam(input)).toBe(DEFAULT_REPO_SORT);
    },
  );
});
