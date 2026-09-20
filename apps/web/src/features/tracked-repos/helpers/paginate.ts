import { FIRST_PAGE, PAGE_SIZE } from '@/constants/pagination';
import type { TrackedRepo, TrackedSortOption } from '../types';

export function pageCount(totalItems: number, pageSize: number = PAGE_SIZE): number {
  // An empty list still has one (empty) page, so the pager never renders "page 1 of 0".
  return Math.max(FIRST_PAGE, Math.ceil(totalItems / pageSize));
}

export function clampPage(page: number, totalItems: number, pageSize: number = PAGE_SIZE): number {
  return Math.min(Math.max(page, FIRST_PAGE), pageCount(totalItems, pageSize));
}

/** Pure slice: the whole list is already in memory, so paging costs no request. */
export function pageSlice<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): readonly T[] {
  const safePage = clampPage(page, items.length, pageSize);
  const start = (safePage - FIRST_PAGE) * pageSize;

  return items.slice(start, start + pageSize);
}

const SORT_COMPARATORS: Record<
  TrackedSortOption,
  (left: TrackedRepo, right: TrackedRepo) => number
> = {
  // ISO timestamps compare correctly as strings, newest first.
  'recently-tracked': (left, right) => right.trackedAt.localeCompare(left.trackedAt),
  name: (left, right) => left.fullName.localeCompare(right.fullName),
};

export function sortTrackedRepos(
  repos: readonly TrackedRepo[],
  sort: TrackedSortOption,
): readonly TrackedRepo[] {
  return [...repos].sort(SORT_COMPARATORS[sort]);
}
