import type { RepoSummary } from '@/types/repo';
import type { REPO_SORT_OPTIONS } from '../constants';

export type RepoSortOption = (typeof REPO_SORT_OPTIONS)[number]['value'];

export type RepoSearchParams = {
  query: string;
  sort: RepoSortOption;
  page: number;
  signal: AbortSignal;
};

/** One page of results plus the metadata `getNextPageParam` needs to stop. */
export type RepoSearchPage = {
  items: readonly RepoSummary[];
  totalCount: number;
  page: number;
};
