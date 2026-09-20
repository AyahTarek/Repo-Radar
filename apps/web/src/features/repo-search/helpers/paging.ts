import { MAX_SEARCH_PAGES, PAGE_SIZE, SEARCH_RESULT_CAP } from '@/constants/pagination';
import type { RepoSummary } from '@/types/repo';
import type { RepoSearchPage } from '../types';

/**
 * Ends the stream on the first of three conditions: GitHub's hard 1,000-result
 * ceiling, the reported total, or a short page. Deriving the page count from
 * `total_count` alone would offer page 400 of a 6,000-match query and every
 * request past 1,000 results would come back as HTTP 422.
 */
export function getNextPageParam(lastPage: RepoSearchPage): number | undefined {
  const loaded = lastPage.page * PAGE_SIZE;

  if (lastPage.items.length < PAGE_SIZE) return undefined;
  if (loaded >= Math.min(lastPage.totalCount, SEARCH_RESULT_CAP)) return undefined;
  if (lastPage.page >= MAX_SEARCH_PAGES) return undefined;

  return lastPage.page + 1;
}

/**
 * GitHub can repeat an item across pages when the ranking shifts between
 * requests, which would otherwise produce duplicate React keys.
 */
export function flattenPages(pages: readonly RepoSearchPage[]): readonly RepoSummary[] {
  const seen = new Set<number>();
  const items: RepoSummary[] = [];

  for (const page of pages) {
    for (const item of page.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
  }

  return items;
}

/** What the user can actually reach, which is never more than the cap. */
export function reachableTotal(totalCount: number): number {
  return Math.min(totalCount, SEARCH_RESULT_CAP);
}
