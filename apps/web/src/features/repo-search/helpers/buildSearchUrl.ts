import { PAGE_SIZE } from '@/constants/pagination';
import { DEFAULT_REPO_SORT } from '../constants';
import type { RepoSortOption } from '../types';

/** GitHub expects no `sort` parameter at all for relevance ordering. */
const SORT_PARAM: Record<RepoSortOption, string | null> = {
  'best-match': null,
  stars: 'stars',
  updated: 'updated',
};

export function buildSearchPath(query: string, sort: RepoSortOption, page: number): string {
  const params = new URLSearchParams({
    q: query,
    per_page: String(PAGE_SIZE),
    page: String(page),
  });

  const sortParam = SORT_PARAM[sort] ?? SORT_PARAM[DEFAULT_REPO_SORT];
  if (sortParam !== null) {
    params.set('sort', sortParam);
    params.set('order', 'desc');
  }

  return `/search/repositories?${params.toString()}`;
}
