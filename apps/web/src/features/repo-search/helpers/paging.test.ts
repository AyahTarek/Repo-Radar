import { describe, expect, it } from 'vitest';
import { MAX_SEARCH_PAGES, PAGE_SIZE, SEARCH_RESULT_CAP } from '@/constants/pagination';
import type { RepoSummary } from '@/types/repo';
import { flattenPages, getNextPageParam, reachableTotal } from './paging';
import type { RepoSearchPage } from '../types';

function repo(id: number): RepoSummary {
  return {
    id,
    fullName: `owner/repo-${id}`,
    owner: 'owner',
    name: `repo-${id}`,
    htmlUrl: `https://github.com/owner/repo-${id}`,
    description: null,
    language: null,
    stars: id,
  };
}

function page(overrides: Partial<RepoSearchPage> = {}): RepoSearchPage {
  return {
    items: Array.from({ length: PAGE_SIZE }, (_, index) => repo(index)),
    totalCount: SEARCH_RESULT_CAP * 6,
    page: 1,
    ...overrides,
  };
}

describe('getNextPageParam', () => {
  it('advances while a full page comes back and results remain', () => {
    expect(getNextPageParam(page({ page: 1 }))).toBe(2);
    expect(getNextPageParam(page({ page: 7 }))).toBe(8);
  });

  it('stops on a short page, which means the results ran out', () => {
    expect(getNextPageParam(page({ items: [repo(1), repo(2)] }))).toBeUndefined();
  });

  it('stops once every reported result is loaded', () => {
    const totalCount = PAGE_SIZE * 2;
    expect(getNextPageParam(page({ page: 2, totalCount }))).toBeUndefined();
  });

  it("stops at GitHub's 1,000-result ceiling even when total_count claims more", () => {
    // The ceiling is the case that matters: without it every further request
    // would come back as HTTP 422.
    expect(getNextPageParam(page({ page: MAX_SEARCH_PAGES }))).toBeUndefined();
    expect(getNextPageParam(page({ page: MAX_SEARCH_PAGES - 1 }))).toBe(MAX_SEARCH_PAGES);
  });
});

describe('flattenPages', () => {
  it('concatenates pages in order', () => {
    const flat = flattenPages([
      page({ items: [repo(1), repo(2)] }),
      page({ items: [repo(3)] }),
    ]);

    expect(flat.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('drops repeats, which GitHub returns when ranking shifts between requests', () => {
    const flat = flattenPages([
      page({ items: [repo(1), repo(2)] }),
      page({ items: [repo(2), repo(3)] }),
    ]);

    expect(flat.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('returns an empty list for no pages', () => {
    expect(flattenPages([])).toEqual([]);
  });
});

describe('reachableTotal', () => {
  it('caps the advertised total at what GitHub will actually serve', () => {
    expect(reachableTotal(42)).toBe(42);
    expect(reachableTotal(SEARCH_RESULT_CAP * 3)).toBe(SEARCH_RESULT_CAP);
  });
});
