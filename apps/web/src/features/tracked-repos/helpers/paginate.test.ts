import { describe, expect, it } from 'vitest';
import { PAGE_SIZE } from '@/constants/pagination';
import { clampPage, pageCount, pageSlice, sortTrackedRepos } from './paginate';
import type { TrackedRepo } from '../types';

function tracked(name: string, trackedAt: string): TrackedRepo {
  return {
    id: name.length,
    fullName: `owner/${name}`,
    owner: 'owner',
    name,
    htmlUrl: `https://github.com/owner/${name}`,
    description: null,
    language: null,
    trackedAt,
  };
}

const items = Array.from({ length: 32 }, (_, index) => index);

describe('pageCount', () => {
  it('counts a partial last page', () => {
    expect(pageCount(PAGE_SIZE * 2 + 1)).toBe(3);
  });

  it('does not add an empty page for an exact multiple', () => {
    expect(pageCount(PAGE_SIZE * 2)).toBe(2);
  });

  it('reports one page when empty, so the pager never says "page 1 of 0"', () => {
    expect(pageCount(0)).toBe(1);
  });
});

describe('clampPage', () => {
  it('pulls out-of-range pages back inside', () => {
    expect(clampPage(999, PAGE_SIZE * 2)).toBe(2);
    expect(clampPage(0, PAGE_SIZE * 2)).toBe(1);
    expect(clampPage(-5, PAGE_SIZE * 2)).toBe(1);
  });

  it('clamps to page 1 when the list empties out', () => {
    expect(clampPage(3, 0)).toBe(1);
  });
});

describe('pageSlice', () => {
  it('returns at most a full page', () => {
    expect(pageSlice(items, 1)).toHaveLength(PAGE_SIZE);
    expect(pageSlice(items, 1).at(0)).toBe(0);
  });

  it('offsets by page', () => {
    expect(pageSlice(items, 2).at(0)).toBe(PAGE_SIZE);
  });

  it('returns the remainder on the last page', () => {
    expect(pageSlice(items, 3)).toHaveLength(items.length - PAGE_SIZE * 2);
  });

  it('clamps instead of returning nothing for an impossible page', () => {
    expect(pageSlice(items, 999)).toEqual(pageSlice(items, 3));
  });
});

describe('sortTrackedRepos', () => {
  const older = tracked('older', '2026-01-01T00:00:00.000Z');
  const newer = tracked('newer', '2026-06-01T00:00:00.000Z');

  it('puts the most recently tracked first', () => {
    const sorted = sortTrackedRepos([older, newer], 'recently-tracked');
    expect(sorted.map((repo) => repo.name)).toEqual(['newer', 'older']);
  });

  it('sorts by full name alphabetically', () => {
    const sorted = sortTrackedRepos([newer, older], 'name');
    expect(sorted.map((repo) => repo.name)).toEqual(['newer', 'older']);
  });

  it('does not mutate the input', () => {
    const input = [newer, older];
    sortTrackedRepos(input, 'name');
    expect(input.map((repo) => repo.name)).toEqual(['newer', 'older']);
  });
});
